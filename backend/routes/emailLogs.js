const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/email-logs
// @desc    Get all system-wide email notification logs
// @access  Private (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const logs = await dbService.emailLogs.find({});
    res.json(logs);
  } catch (err) {
    console.error('Error fetching email logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
