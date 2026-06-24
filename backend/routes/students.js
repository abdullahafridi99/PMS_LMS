const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// Helper to validate Pakistani phone numbers
const validatePakistanPhone = (phone) => {
  if (!phone) return true; // Phone is optional in profile, so empty is valid
  const clean = String(phone).trim().replace(/[-\s]/g, '');
  const regex = /^((\+92)|(0092)|(92))?3\d{9}$|^03\d{9}$/;
  return regex.test(clean);
};

// Helper to dynamically generate the next sequential Student ID
// Formula: PMS-[YEAR]-[SEQ_NUM] (e.g., PMS-2026-0125)
const generateSequentialStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `PMS-${currentYear}-`;
  
  try {
    const students = await dbService.users.find({ role: 'student' });
    let maxSeq = 0;
    
    students.forEach(student => {
      if (student.studentId && student.studentId.startsWith(prefix)) {
        const parts = student.studentId.split('-');
        if (parts.length === 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });
    
    const nextSeq = maxSeq + 1;
    const paddedSeq = String(nextSeq).padStart(4, '0');
    return `${prefix}${paddedSeq}`;
  } catch (error) {
    console.error('Error generating student ID:', error.message);
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}${randomSeq}`;
  }
};

// @route   GET api/students
// @desc    Get all students (or filter by class/section)
// @access  Private (Admin or Parent)
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = { role: 'student' };
    
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;

    let students = await dbService.users.find(filter);
    
    if (req.user.role === 'parent') {
      const parentRecord = await dbService.users.findById(req.user.id);
      const parentEmail = parentRecord ? parentRecord.email : req.user.email;
      const childrenEmails = parentRecord && parentRecord.childrenEmails ? parentRecord.childrenEmails : [];
      
      students = students.filter(student => 
        student.parentEmail === parentEmail || childrenEmails.includes(student.email)
      );
    } else if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Requires Admin, Teacher or Parent role' });
    }

    // Remove passwords before returning
    const safeStudents = students.map(student => {
      const { password, ...s } = student;
      return s;
    });

    res.json(safeStudents);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/students
// @desc    Add a new student (creates student + parent accounts, sends credentials alerts)
// @access  Private (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name, email, rollNumber, class: className, section, parentEmail, phone, address, password, studentId } = req.body;

  if (!name || !email || !rollNumber || !className || !section || !parentEmail) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  if (phone && !validatePakistanPhone(phone)) {
    return res.status(400).json({ 
      message: 'Invalid phone number format. Must be a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).' 
    });
  }

  try {
    // Check if student email already exists
    const existingUser = await dbService.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A student user with this email already exists' });
    }

    // Auto-generate unique Student ID utilizing PMS-YEAR-SEQ formula
    const finalStudentId = studentId || await generateSequentialStudentId();
    const existingStudentId = await dbService.users.findOne({ studentId: finalStudentId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'This Student ID is already assigned. Please retry.' });
    }

    // Hash password (use provided password or default to studentId + "123")
    const rawStudentPass = password || `${finalStudentId.toLowerCase()}123`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawStudentPass, salt);

    // Create student account
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

    // Auto-Provision Parent Profile
    let rawParentPass = 'parent123';
    const existingParent = await dbService.users.findOne({ email: parentEmail, role: 'parent' });
    
    if (!existingParent) {
      // Create a new parent profile with custom credentials
      const parentSalt = await bcrypt.genSalt(10);
      const hashedParentPassword = await bcrypt.hash(rawParentPass, parentSalt);
      
      await dbService.users.create({
        name: `Parent of ${name}`,
        email: parentEmail,
        password: hashedParentPassword,
        role: 'parent',
        childrenEmails: [email],
        phone: phone || '',
        address: address || ''
      });

      console.log(`👨‍👩‍👦 Provisioned parent profile for ${parentEmail}`);
    } else {
      // Parent already exists, update children mappings
      const updatedChildren = existingParent.childrenEmails || [];
      if (!updatedChildren.includes(email)) {
        updatedChildren.push(email);
        await dbService.users.findByIdAndUpdate(existingParent._id || existingParent.id, {
          childrenEmails: updatedChildren
        });
      }
    }

    // Queue Welcome Notifications to Student
    const studentHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #0d9488; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0d9488;">Welcome to PMS School Portal</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your student account has been successfully created. You can log in using the credentials below:</p>
        <div style="background-color: #f0fdfa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Portal URL:</strong> <a href="http://localhost:5173/student-login">Student Dashboard</a></p>
          <p style="margin: 5px 0;"><strong>Student ID:</strong> ${finalStudentId}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${rawStudentPass}</p>
        </div>
        <p style="font-size: 12px; color: #666;">Please change your temporary password upon logging in for security purposes.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p style="font-weight: bold; color: #0d9488;">PMS Administration</p>
      </div>
    `;
    await emailService.sendEmail(email, 'Welcome to PMS - Student Account Created', studentHtml);

    // Queue Notification credentials to Parent
    const parentHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #0d9488; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0d9488;">PMS School - Parent Portal Provisioned</h2>
        <p>Dear Parent/Guardian,</p>
        <p>An account has been created for you to monitor the academic progress, attendance records, and outstanding fees for <strong>${name}</strong>.</p>
        <div style="background-color: #f0fdfa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Portal URL:</strong> <a href="http://localhost:5173/parent-login">Parent Dashboard</a></p>
          <p style="margin: 5px 0;"><strong>Username:</strong> ${parentEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${rawParentPass}</p>
        </div>
        <p>If you already have a parent account, you can log in with your existing password and access the new child profile via the dashboard switcher.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p style="font-weight: bold; color: #0d9488;">PMS Administration</p>
      </div>
    `;
    await emailService.sendEmail(parentEmail, 'Welcome to PMS - Parent Portal Access Credentials', parentHtml);

    // Send WhatsApp/SMS simulated messages
    const smsMessage = `Welcome to PMS. Account created for student ${name} (ID: ${finalStudentId}) & parent. Temporary credentials sent to emails.`;
    if (phone) {
      await smsService.sendSms(phone, smsMessage, 'absentee_alert', 'Parent');
    }

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'STUDENT_ENROLLMENT',
      details: `Enrolled student ${name} (${finalStudentId}) in ${className}-${section} and linked parent ${parentEmail}`,
      userId: req.user.id,
      userRole: req.user.role
    });

    const { password: _, ...safeStudent } = newStudent;
    res.status(201).json(safeStudent);
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/students/:id
// @desc    Update student profile and log audit changes
// @access  Private (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, email, rollNumber, class: className, section, parentEmail, phone, address, studentId } = req.body;

  if (phone && !validatePakistanPhone(phone)) {
    return res.status(400).json({ 
      message: 'Invalid phone number format. Must be a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).' 
    });
  }

  try {
    const student = await dbService.users.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (studentId && studentId !== student.studentId) {
      const existing = await dbService.users.findOne({ studentId });
      if (existing) {
        return res.status(400).json({ message: 'This Student ID is already assigned' });
      }
    }

    const updateFields = {
      name: name || student.name,
      email: email || student.email,
      rollNumber: rollNumber || student.rollNumber,
      studentId: studentId || student.studentId,
      class: className || student.class,
      section: section || student.section,
      parentEmail: parentEmail || student.parentEmail,
      phone: phone !== undefined ? phone : student.phone,
      address: address !== undefined ? address : student.address
    };

    const updatedStudent = await dbService.users.findByIdAndUpdate(req.params.id, updateFields);

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'STUDENT_UPDATE',
      details: `Updated details for student ${student.name} (${student.studentId})`,
      userId: req.user.id,
      userRole: req.user.role
    });

    const { password, ...safeStudent } = updatedStudent;
    res.json(safeStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/students/:id
// @desc    Delete student profile and log audit changes
// @access  Private (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const student = await dbService.users.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    await dbService.users.findByIdAndDelete(req.params.id);

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'STUDENT_DELETION',
      details: `Deleted student record: ${student.name} (${student.studentId})`,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.json({ message: 'Student successfully deleted', studentId: req.params.id });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
