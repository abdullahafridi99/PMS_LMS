const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/sms-logs
// @desc    Get simulated SMS logs
// @access  Private (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const logs = await dbService.smsLogs.find({});
    res.json(logs);
  } catch (err) {
    console.error('Error fetching SMS logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
