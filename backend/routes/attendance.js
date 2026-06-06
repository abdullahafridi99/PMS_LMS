const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/attendance
// @desc    Get attendance records for a class on a specific date
// @access  Private (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  const { class: className, section, date } = req.query;

  if (!className || !section || !date) {
    return res.status(400).json({ message: 'Please provide class, section, and date' });
  }

  try {
    const records = await dbService.attendance.find({ class: className, section, date });
    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/attendance/bulk
// @desc    Mark bulk attendance for a class on a specific date
// @access  Private (Admin only)
router.post('/bulk', verifyToken, isAdmin, async (req, res) => {
  const { records } = req.body; // Array of records: { studentId, studentName, rollNumber, class, section, date, status }

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of attendance records' });
  }

  try {
    const upsertedRecords = [];
    for (let record of records) {
      const saved = await dbService.attendance.upsert(record);
      upsertedRecords.push(saved);
    }
    res.json({ message: 'Attendance records updated successfully', count: upsertedRecords.length, data: upsertedRecords });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/attendance/student/:studentId
// @desc    Get attendance history and percentage for a specific student
// @access  Private
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    // Basic authorization check: Students and parents can only see their own / child's attendance
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    if (requesterRole !== 'admin' && requesterId !== req.params.studentId) {
      // If parent, check if student email belongs to their children list
      if (requesterRole === 'parent') {
        const parent = await dbService.users.findById(requesterId);
        const child = await dbService.users.findById(req.params.studentId);
        if (!parent || !child || !parent.childrenEmails.includes(child.email)) {
          return res.status(403).json({ message: 'Unauthorized access to student data' });
        }
      } else {
        return res.status(403).json({ message: 'Unauthorized access to student data' });
      }
    }

    const records = await dbService.attendance.find({ studentId: req.params.studentId });
    
    // Calculate percentages
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const absentDays = records.filter(r => r.status === 'absent').length;

    // Late counts as 0.5 present, or we can just count it full or separate. Let's count Late as present but track it separately.
    // Standard attendance percentage: (Present + Late) / Total
    const attendancePercentage = totalDays > 0 
      ? Math.round(((presentDays + lateDays) / totalDays) * 100) 
      : 100;

    res.json({
      summary: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        attendancePercentage
      },
      records: records.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort descending date
    });
  } catch (err) {
    console.error('Error calculating student attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
