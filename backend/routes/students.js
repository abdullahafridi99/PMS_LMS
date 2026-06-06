const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/students
// @desc    Get all students (or filter by class/section)
// @access  Private (Admin or Parent)
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = { role: 'student' };
    
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;

    let students = await dbService.users.find(filter);
    
    // If the user is a parent, only show their children
    if (req.user.role === 'parent') {
      const parentRecord = await dbService.users.findById(req.user.id);
      const parentEmail = parentRecord ? parentRecord.email : req.user.email;
      const childrenEmails = parentRecord && parentRecord.childrenEmails ? parentRecord.childrenEmails : [];
      
      students = students.filter(student => 
        student.parentEmail === parentEmail || childrenEmails.includes(student.email)
      );
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Requires Admin or Parent role' });
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
// @desc    Add a new student (creates a user account too)
// @access  Private (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name, email, rollNumber, class: className, section, parentEmail, phone, address, password, studentId } = req.body;

  if (!name || !email || !rollNumber || !className || !section || !parentEmail) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    // Check if email already exists
    const existingUser = await dbService.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Auto-generate or check studentId
    const finalStudentId = studentId || `PMS-STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingStudentId = await dbService.users.findOne({ studentId: finalStudentId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'This Student ID is already assigned. Please enter a different one.' });
    }

    // Hash password (use provided password or default to finalStudentId + "123")
    const passToHash = password || `${finalStudentId.toLowerCase()}123`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passToHash, salt);

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

    // Automatically check if the parent account exists, if not, we can create/seed one or just link it.
    // In our design, parents will log in with parentEmail. If no parent account exists, we can automatically create a default parent account.
    const existingParent = await dbService.users.findOne({ email: parentEmail, role: 'parent' });
    if (!existingParent) {
      // Create a default parent account
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
    console.error('Error creating student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/students/:id
// @desc    Update a student's profile
// @access  Private (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, email, rollNumber, class: className, section, parentEmail, phone, address, studentId } = req.body;

  try {
    const student = await dbService.users.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if new studentId is unique
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
    const { password, ...safeStudent } = updatedStudent;
    res.json(safeStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/students/:id
// @desc    Delete a student
// @access  Private (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const student = await dbService.users.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete student
    await dbService.users.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student successfully deleted', studentId: req.params.id });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
