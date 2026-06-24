const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');
const smsService = require('../services/smsService');
const { socketEmitService } = require('../sockets/socketHandler');

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
  const { records } = req.body; 

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of attendance records' });
  }

  try {
    const upsertedRecords = [];
    for (let record of records) {
      const saved = await dbService.attendance.upsert(record);
      upsertedRecords.push(saved);
      
      // If student marked absent, trigger alerts
      if (record.status === 'absent') {
        await triggerAbsentSms(record.studentId, record.studentName, record.rollNumber, record.date);
      }
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
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    if (requesterRole !== 'admin' && requesterRole !== 'teacher' && requesterId !== req.params.studentId) {
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
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const absentDays = records.filter(r => r.status === 'absent').length;

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
      records: records.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  } catch (err) {
    console.error('Error calculating student attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper for sending SMS logs & Socket alerts on student absence
const triggerAbsentSms = async (studentId, studentName, rollNumber, date) => {
  try {
    const student = await dbService.users.findById(studentId);
    if (!student) return;

    const parent = await dbService.users.findOne({ email: student.parentEmail, role: 'parent' });
    let parentName = 'Parent';
    let parentPhone = student.phone || '+92 300 1234567';
    if (parent) {
      parentName = parent.name || parentName;
      parentPhone = parent.phone || parentPhone;

      // Real-time socket alert to Parent
      socketEmitService.notifyUser(parent._id || parent.id, 'absent_alert', {
        studentName,
        date,
        message: `${studentName} was marked absent today.`
      });
    }

    // Urdu message (Meta / Twilio template)
    const urduMessage = smsService.templates.getAbsenteeMsg(studentName, date, 'ur');
    await smsService.sendSms(parentPhone, urduMessage, 'absentee_alert', parentName);

    console.log(`[SMS Sentinel] Dispatched absentee alert to parent ${parentName}`);
  } catch (err) {
    console.error('Error triggering absent SMS alert:', err);
  }
};

// @route   POST api/attendance/check-in
// @desc    Check-in via QR Code scan (Student or Teacher)
// @access  Private (Admin only)
router.post('/check-in', verifyToken, isAdmin, async (req, res) => {
  const { role, identifier, status } = req.body; 

  if (!role || !identifier) {
    return res.status(400).json({ message: 'Role and identifier are required' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  try {
    if (role === 'student') {
      let student;
      if (dbService.isMongo()) {
        student = await dbService.users.findOne({
          $or: [
            { studentId: identifier },
            { rollNumber: identifier },
            { email: identifier }
          ],
          role: 'student'
        });
      } else {
        const studentsList = await dbService.users.find({ role: 'student' });
        student = studentsList.find(s => 
          s.studentId === identifier || 
          s.rollNumber === identifier || 
          s.email === identifier
        );
      }

      if (!student) {
        return res.status(404).json({ message: 'Student not found with matching QR credentials' });
      }

      const record = {
        studentId: student._id || student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        date: todayStr,
        status: status || 'present'
      };

      const saved = await dbService.attendance.upsert(record);
      
      // Dispatch Socket alerts to parent if checking in
      if (student.parentEmail) {
        const parent = await dbService.users.findOne({ email: student.parentEmail, role: 'parent' });
        if (parent) {
          socketEmitService.notifyUser(parent._id || parent.id, 'attendance_scan', {
            studentName: student.name,
            time: timeStr,
            date: todayStr,
            status: saved.status
          });
        }
      }

      return res.json({
        message: 'Student QR Check-in successful',
        role: 'student',
        data: {
          name: student.name,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section,
          status: saved.status,
          time: timeStr
        }
      });
    } else if (role === 'teacher') {
      // Find teacher in users collection by cnic or email
      let teacher = await dbService.users.findOne({
        $or: [
          { cnic: identifier },
          { studentId: identifier },
          { email: identifier }
        ],
        role: 'teacher'
      });

      if (!teacher) {
        // Check dynamic settings staff list as fallback
        const settings = await dbService.settings.findOne({ key: 'landing_page' });
        const staffList = settings?.staffList || [];
        const foundStaff = staffList.find(s => 
          s.cnic === identifier || s.email?.toLowerCase() === identifier.toLowerCase()
        );
        if (foundStaff) {
          teacher = {
            name: foundStaff.name,
            title: foundStaff.title,
            studentId: foundStaff.cnic
          };
        }
      }

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher/Staff member not found with matching QR credentials' });
      }

      const record = {
        staffId: teacher.studentId || teacher.cnic || teacher.name.replace(/\s+/g, '_').toLowerCase(),
        name: teacher.name,
        title: teacher.title || 'Faculty',
        date: todayStr,
        time: timeStr,
        status: status || 'present'
      };

      const saved = await dbService.staffAttendance.upsert(record);
      return res.json({
        message: 'Teacher QR Check-in successful',
        role: 'teacher',
        data: {
          name: teacher.name,
          title: teacher.title || 'Faculty',
          status: saved.status,
          time: timeStr
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
  } catch (err) {
    console.error('Error during QR check-in:', err);
    res.status(500).json({ message: 'Server error during check-in processing' });
  }
});

// @route   GET api/attendance/staff
// @desc    Get staff attendance logs
// @access  Private (Admin only)
router.get('/staff', verifyToken, isAdmin, async (req, res) => {
  try {
    const records = await dbService.staffAttendance.find({});
    res.json(records);
  } catch (err) {
    console.error('Error fetching staff attendance logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/attendance/teacher/my-logs
// @desc    Get logged-in teacher's own attendance logs
// @access  Private (Teacher only)
router.get('/teacher/my-logs', verifyToken, async (req, res) => {
  try {
    const staffId = req.user.studentId || req.user.name.replace(/\s+/g, '_').toLowerCase();
    const records = await dbService.staffAttendance.find({ staffId });
    res.json(records);
  } catch (err) {
    console.error('Error fetching teacher logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
