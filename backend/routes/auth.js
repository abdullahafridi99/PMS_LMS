const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// Helper to clean CNIC numbers
const cleanCnic = (val) => String(val || '').trim().replace(/[-\s]/g, '');

// @route   POST api/auth/login
// @desc    Authenticate user, handle Admin 2FA simulation, log active sessions
// @access  Public
router.post('/login', async (req, res) => {
  const { email, studentId, password, role, otp } = req.body;

  if (role === 'student') {
    if (!studentId || !password) {
      return res.status(400).json({ message: 'Please enter Student ID and password' });
    }
  } else {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter Email and password' });
    }
  }

  try {
    let user;
    if (role === 'student') {
      user = await dbService.users.findOne({ studentId });
      if (!user) {
        return res.status(400).json({ message: 'Student ID not found' });
      }
    } else {
      user = await dbService.users.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email address not found' });
      }
    }

    // Role check
    if (user.role !== role) {
      return res.status(400).json({ message: 'Selected role does not match user account' });
    }

    // Password validation
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials password' });
    }

    // Admin 2FA OTP simulation
    if (role === 'admin') {
      if (!otp) {
        // Generate 6-digit OTP code
        const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Save to user profile
        await dbService.users.findByIdAndUpdate(user._id || user.id, {
          twoFactorOTP: generatedOtp,
          twoFactorOTPExpires: otpExpiry
        });

        // Send OTP via email and SMS
        const otpEmailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #0d9488; border-radius: 8px; max-width: 500px;">
            <h2 style="color: #0d9488;">PMS Portal Security - Two-Factor Authentication</h2>
            <p>Please enter the following one-time password (OTP) code to complete your administrator sign-in request:</p>
            <div style="background-color: #f0fdfa; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0d9488;">${generatedOtp}</span>
            </div>
            <p style="font-size: 12px; color: #666;">This code is valid for 10 minutes. If you did not request this login, please change your credentials immediately.</p>
          </div>
        `;
        const recipientEmail = (role === 'admin' && process.env.SMTP_USER) ? process.env.SMTP_USER : user.email;
        await emailService.sendEmail(recipientEmail, 'PMS Admin Portal - 2FA Verification Code', otpEmailHtml);
        
        if (user.phone) {
          await smsService.sendSms(user.phone, `PMS security code: ${generatedOtp}. Valid for 10 mins.`, 'absentee_alert', 'Admin');
        }

        return res.json({ twoFactorRequired: true, message: '2FA verification code sent to your email.' });
      } else {
        // Verify OTP code
        if (!user.twoFactorOTP || user.twoFactorOTP !== otp || new Date(user.twoFactorOTPExpires) < new Date()) {
          return res.status(400).json({ message: 'Invalid or expired 2FA code. Please retry.' });
        }
        // Clear OTP code after successful authentication
        await dbService.users.findByIdAndUpdate(user._id || user.id, {
          twoFactorOTP: null,
          twoFactorOTPExpires: null
        });
      }
    }

    // Generate JWT token
    const payload = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      section: user.section,
      studentId: user.studentId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Track sessions
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientDevice = req.headers['user-agent'] || 'Unknown Device';
    
    const activeSessions = user.activeSessions || [];
    activeSessions.push({
      token: token,
      ip: clientIp,
      device: clientDevice,
      createdAt: new Date()
    });

    await dbService.users.findByIdAndUpdate(user._id || user.id, { activeSessions });

    // Return token and safe user
    const { password: _, twoFactorOTP, twoFactorOTPExpires, ...safeUser } = user;
    res.json({
      token,
      user: { ...safeUser, activeSessions }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile details
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await dbService.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, twoFactorOTP, twoFactorOTPExpires, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/sessions
// @desc    List active sessions
// @access  Private
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const user = await dbService.users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.activeSessions || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/sessions/terminate
// @desc    Terminate a specific session
// @access  Private
router.post('/sessions/terminate', verifyToken, async (req, res) => {
  const { tokenToTerminate } = req.body;
  if (!tokenToTerminate) return res.status(400).json({ message: 'Token to terminate is required' });

  try {
    const user = await dbService.users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activeSessions = (user.activeSessions || []).filter(s => s.token !== tokenToTerminate);
    await dbService.users.findByIdAndUpdate(req.user.id, { activeSessions });
    res.json({ message: 'Session successfully terminated', sessions: activeSessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/signup/admin
// @desc    Admin signup route (strictly secured via secret key)
// @access  Public (secured by adminKey)
router.post('/signup/admin', async (req, res) => {
  const { name, email, password, adminKey } = req.body;

  if (!name || !email || !password || !adminKey) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (adminKey !== 'PMS-ZANGALI-ADMIN-KEY') {
    return res.status(401).json({ message: 'Invalid Admin Authorization Key' });
  }

  try {
    const existingUser = await dbService.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await dbService.users.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    const { password: _, ...safeAdmin } = newAdmin;
    res.status(201).json(safeAdmin);
  } catch (err) {
    console.error('Admin signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/signup/teacher
// @desc    Register a new teacher profile after CNIC verification
// @access  Public
router.post('/signup/teacher', async (req, res) => {
  const { name, email, password, cnic, phone, bio } = req.body;

  if (!name || !email || !password || !cnic) {
    return res.status(400).json({ message: 'Please enter name, email, password and CNIC' });
  }

  try {
    const existingUser = await dbService.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Verify teacher against tenant staff cnic records list
    const settings = await dbService.settings.findOne({ key: 'landing_page' }) || { staffList: [] };
    const cleanedInputCnic = cleanCnic(cnic);
    
    const staffRecord = settings.staffList.find(s => cleanCnic(s.cnic) === cleanedInputCnic);
    if (!staffRecord) {
      return res.status(400).json({ 
        message: 'This CNIC is not registered in the school records. Please contact the administrator first.' 
      });
    }

    // Check if CNIC was already claimed
    const existingCnicUser = await dbService.users.findOne({ cnic: cleanedInputCnic });
    if (existingCnicUser) {
      return res.status(400).json({ message: 'This CNIC is already linked to a registered account.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = await dbService.users.create({
      name: staffRecord.name || name,
      email,
      password: hashedPassword,
      role: 'teacher',
      phone: phone || staffRecord.phone || '',
      address: staffRecord.bio || bio || '',
      cnic: cleanedInputCnic,
      studentId: cnic // Map cnic to studentId for check-in scans compatibility
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #0d9488; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0d9488;">[PMS System Alert] New Faculty Register</h2>
        <p>Dear Administrator,</p>
        <p>A new teacher has successfully completed portal registration:</p>
        <ul>
          <li><strong>Name:</strong> ${newTeacher.name}</li>
          <li><strong>Email:</strong> ${newTeacher.email}</li>
          <li><strong>CNIC:</strong> ${cnic}</li>
          <li><strong>Phone:</strong> ${newTeacher.phone}</li>
        </ul>
      </div>
    `;
    await emailService.sendEmail('admin@pms.edu', `[Alert] New Faculty Signed Up: ${newTeacher.name}`, emailHtml);

    const { password: _, ...safeTeacher } = newTeacher;
    res.status(201).json(safeTeacher);
  } catch (err) {
    console.error('Teacher signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Self-Registration for Students & Parents is disabled (Return 403 Forbidden)
router.post('/signup/student', (req, res) => {
  res.status(403).json({ message: 'Public Student Self-Registration is strictly disabled. Please contact Admin.' });
});

router.post('/signup/parent', (req, res) => {
  res.status(403).json({ message: 'Public Parent Self-Registration is strictly disabled. Please contact Admin.' });
});

module.exports = router;
