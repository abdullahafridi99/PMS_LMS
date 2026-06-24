const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken } = require('../middleware/auth');

// @route   POST api/homework
// @desc    Assign homework task (Admin/Teacher only)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { title, description, class: className, subject, deadline, fileUrl } = req.body;

  if (!title || !className || !subject) {
    return res.status(400).json({ message: 'Title, Class, and Subject are required fields' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Requires Admin/Teacher permissions' });
  }

  try {
    const hw = await dbService.homework.create({
      title,
      description: description || '',
      class: className,
      subject,
      deadline: deadline ? new Date(deadline) : null,
      fileUrl: fileUrl || '',
      submissions: []
    });
    res.status(201).json(hw);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/homework
// @desc    Fetch active homework tasks (filterable by class)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;

    // Direct student restrictions
    if (req.user.role === 'student') {
      filter.class = req.user.class;
    }

    const homeworks = await dbService.homework.find(filter);
    res.json(homeworks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/homework/:id/submit
// @desc    Student uploads homework submission
// @access  Private (Student only)
router.put('/:id/submit', verifyToken, async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ message: 'Please provide submission document URL' });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can submit homework' });
  }

  try {
    const hwList = await dbService.homework.find({ _id: req.params.id });
    const hw = hwList && hwList[0];
    if (!hw) return res.status(404).json({ message: 'Homework assignment not found' });

    // Enforce deadline check if applicable
    if (hw.deadline && new Date() > new Date(hw.deadline)) {
      // Allow late submission but log it, or block if strict. Let's allow late submission.
    }

    // Check if student already submitted, if so update it
    const submissions = hw.submissions || [];
    const idx = submissions.findIndex(s => s.studentId === req.user.studentId || s.studentId === req.user.id);
    
    const submissionData = {
      studentId: req.user.studentId || req.user.id,
      studentName: req.user.name,
      fileUrl,
      submittedAt: new Date(),
      grade: idx !== -1 ? submissions[idx].grade : '',
      feedback: idx !== -1 ? submissions[idx].feedback : ''
    };

    if (idx !== -1) {
      submissions[idx] = submissionData;
    } else {
      submissions.push(submissionData);
    }

    const updated = await dbService.homework.findByIdAndUpdate(hw._id || hw.id, { submissions });
    res.json(updated);
  } catch (err) {
    console.error('Homework submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/homework/:id/grade
// @desc    Teacher/Admin grades student submission
// @access  Private (Teacher/Admin only)
router.put('/:id/grade', verifyToken, async (req, res) => {
  const { studentId, grade, feedback } = req.body;

  if (!studentId || !grade) {
    return res.status(400).json({ message: 'Student ID and Grade are required parameters' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const hwList = await dbService.homework.find({ _id: req.params.id });
    const hw = hwList && hwList[0];
    if (!hw) return res.status(404).json({ message: 'Homework assignment not found' });

    const submissions = hw.submissions || [];
    const idx = submissions.findIndex(s => s.studentId === studentId);
    if (idx === -1) {
      return res.status(400).json({ message: 'No active student submission found to grade' });
    }

    submissions[idx].grade = grade;
    submissions[idx].feedback = feedback || '';

    const updated = await dbService.homework.findByIdAndUpdate(hw._id || hw.id, { submissions });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
