const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, studentId, password, role } = req.body;

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
      // Find student by studentId
      user = await dbService.users.findOne({ studentId });
      if (!user) {
        return res.status(400).json({ message: 'Student does not exist with this Student ID' });
      }
    } else {
      // Find admin/parent by email
      user = await dbService.users.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User does not exist with this email' });
      }
    }

    // Validate role
    if (user.role !== role) {
      return res.status(400).json({ message: `Access denied. Selected role does not match user profile.` });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials/password' });
    }

    // Generate JWT
    const payload = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      section: user.section,
      studentId: user.studentId
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Remove password from returned user details
        const { password, ...userWithoutPassword } = user;
        
        res.json({
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current logged in user details
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await dbService.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/signup/admin
// @desc    Register a new admin
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

// @route   POST api/auth/signup/student
// @desc    Register a new student profile
// @access  Public
router.post('/signup/student', async (req, res) => {
  const { name, email, rollNumber, class: className, section, parentEmail, phone, address, password } = req.body;

  if (!name || !email || !rollNumber || !className || !section || !parentEmail || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const existingUser = await dbService.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A student with this email already exists' });
    }

    // Auto-generate studentId
    const finalStudentId = `PMS-STU-${Math.floor(1000 + Math.random() * 9000)}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = await dbService.users.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      studentId: finalStudentId,
      rollNumber,
      class: className,
      section,
      parentEmail,
      phone: phone || '',
      address: address || ''
    });

    // Handle parent link automatically if parent exists, else create default parent account
    const existingParent = await dbService.users.findOne({ email: parentEmail, role: 'parent' });
    if (!existingParent) {
      const parentSalt = await bcrypt.genSalt(10);
      const defaultParentPassword = await bcrypt.hash('parent123', parentSalt);
      await dbService.users.create({
        name: `Parent of ${name}`,
        email: parentEmail,
        password: defaultParentPassword,
        role: 'parent',
        childrenEmails: [email],
        phone: phone || '',
        address: address || ''
      });
    }

    const { password: _, ...safeStudent } = newStudent;
    res.status(201).json(safeStudent);
  } catch (err) {
    console.error('Student signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/signup/parent
// @desc    Register a new parent profile
// @access  Public
router.post('/signup/parent', async (req, res) => {
  const { name, email, phone, address, password, childEmail } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter name, email and password' });
  }

  try {
    const existingUser = await dbService.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A parent with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const childrenEmails = childEmail ? [childEmail] : [];

    const newParent = await dbService.users.create({
      name,
      email,
      password: hashedPassword,
      role: 'parent',
      phone: phone || '',
      address: address || '',
      childrenEmails
    });

    // If childEmail was linked, update child's parentEmail mapping
    if (childEmail) {
      const child = await dbService.users.findOne({ email: childEmail, role: 'student' });
      if (child) {
        await dbService.users.findByIdAndUpdate(child.id || child._id, { parentEmail: email });
      }
    }

    const { password: _, ...safeParent } = newParent;
    res.status(201).json(safeParent);
  } catch (err) {
    console.error('Parent signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
