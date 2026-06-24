const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Helper to map score to letter grade
const calculateGrade = (score, max) => {
  const percentage = (score / max) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

// @route   POST api/exams
// @desc    Upload exam marks (Teacher/Admin only)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { term, class: className, subject, maxMarks = 100, marks } = req.body;

  if (!term || !className || !subject || !marks || !Array.isArray(marks)) {
    return res.status(400).json({ message: 'Please enter term, class, subject, and marks list' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Requires Admin or Teacher role' });
  }

  try {
    // Sort marks descending to calculate positions
    const sortedMarks = [...marks].sort((a, b) => Number(b.score) - Number(a.score));
    
    // Process marks with positions and grades
    const processedMarks = sortedMarks.map((m, index) => {
      return {
        studentId: m.studentId,
        studentName: m.studentName,
        rollNumber: m.rollNumber || '',
        score: Number(m.score),
        grade: calculateGrade(Number(m.score), Number(maxMarks)),
        position: index + 1
      };
    });

    const exam = await dbService.exams.create({
      term,
      class: className,
      subject,
      maxMarks: Number(maxMarks),
      marks: processedMarks,
      createdBy: req.user.name
    });

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'EXAM_MARKS_UPLOAD',
      details: `Uploaded ${subject} exam marks for ${className} (${term})`,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error('Error creating exam marks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/exams
// @desc    Retrieve exam logs (filterable by term, class, subject)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.term) filter.term = req.query.term;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;

    const exams = await dbService.exams.find(filter);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/exams/report-card/:studentId
// @desc    Compile report cards for a student across all subjects
// @access  Private (Admin, Teacher, Parents, and Students)
router.get('/report-card/:studentId', verifyToken, async (req, res) => {
  const { studentId } = req.params;

  try {
    // Auth check
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      const student = await dbService.users.findById(studentId);
      const studentUid = student ? student.studentId : '';
      if (req.user.role === 'student' && req.user.studentId !== studentUid && req.user.id !== studentId) {
        return res.status(403).json({ message: 'Access denied to other student report cards' });
      }
      if (req.user.role === 'parent') {
        const parent = await dbService.users.findById(req.user.id);
        const childrenEmails = parent ? (parent.childrenEmails || []) : [];
        if (student && !childrenEmails.includes(student.email)) {
          return res.status(403).json({ message: 'Access denied to non-child report card' });
        }
      }
    }

    const studentRecord = await dbService.users.findById(studentId) || await dbService.users.findOne({ studentId });
    if (!studentRecord) return res.status(404).json({ message: 'Student record not found' });

    const studentUid = studentRecord.studentId || studentRecord._id || studentRecord.id;
    const allExams = await dbService.exams.find({ class: studentRecord.class });

    const reportCard = {};
    allExams.forEach(exam => {
      const studentMark = exam.marks.find(m => String(m.studentId) === String(studentUid) || String(m.studentId) === String(studentRecord._id));
      if (studentMark) {
        if (!reportCard[exam.term]) {
          reportCard[exam.term] = [];
        }
        reportCard[exam.term].push({
          subject: exam.subject,
          score: studentMark.score,
          maxMarks: exam.maxMarks,
          grade: studentMark.grade,
          position: studentMark.position,
          totalStudents: exam.marks.length
        });
      }
    });

    res.json({
      studentName: studentRecord.name,
      studentId: studentUid,
      class: studentRecord.class,
      rollNumber: studentRecord.rollNumber,
      termsReport: reportCard
    });
  } catch (err) {
    console.error('Error generating report card:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
