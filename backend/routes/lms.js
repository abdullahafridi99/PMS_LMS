const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   POST api/lms
// @desc    Create course curriculum folder (Admin/Teacher only)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { courseName, class: className, subject } = req.body;

  if (!courseName || !className || !subject) {
    return res.status(400).json({ message: 'Please enter courseName, class, and subject' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Requires Admin or Teacher permissions' });
  }

  try {
    const newCourse = await dbService.lms.create({
      courseName,
      class: className,
      subject,
      lectures: [],
      notes: [],
      quizzes: []
    });
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/lms
// @desc    Get courses filterable by class/subject
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;
    
    // If student/parent, limit class to their designated grade
    if (req.user.role === 'student') {
      filter.class = req.user.class;
    } else if (req.user.role === 'parent') {
      // Parent can switch, so they query with class. We authorize on client grade selection.
    }

    const courses = await dbService.lms.find(filter);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/lms/:id/lectures
// @desc    Publish a new video lecture link (Teacher/Admin only)
// @access  Private
router.put('/:id/lectures', verifyToken, async (req, res) => {
  const { title, videoUrl, description } = req.body;

  if (!title || !videoUrl) {
    return res.status(400).json({ message: 'Title and Video URL are required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const course = await dbService.lms.findOne({ _id: req.params.id }) || await dbService.lms.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lectures = course.lectures || [];
    lectures.push({ title, videoUrl, description: description || '' });

    const updated = await dbService.lms.findByIdAndUpdate(course._id || course.id, { lectures });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/lms/:id/notes
// @desc    Publish new PDF note sheets (Teacher/Admin only)
// @access  Private
router.put('/:id/notes', verifyToken, async (req, res) => {
  const { title, fileUrl } = req.body;

  if (!title || !fileUrl) {
    return res.status(400).json({ message: 'Title and File URL are required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const course = await dbService.lms.findOne({ _id: req.params.id }) || await dbService.lms.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const notes = course.notes || [];
    notes.push({ title, fileUrl });

    const updated = await dbService.lms.findByIdAndUpdate(course._id || course.id, { notes });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/lms/:id/quizzes
// @desc    Publish timed MCQ Quiz (Teacher/Admin only)
// @access  Private
router.put('/:id/quizzes', verifyToken, async (req, res) => {
  const { quizTitle, durationMinutes = 15, questions } = req.body;

  if (!quizTitle || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Please provide quizTitle and questions list' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const course = await dbService.lms.findOne({ _id: req.params.id }) || await dbService.lms.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quizzes = course.quizzes || [];
    quizzes.push({ quizTitle, durationMinutes: Number(durationMinutes), questions });

    const updated = await dbService.lms.findByIdAndUpdate(course._id || course.id, { quizzes });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
