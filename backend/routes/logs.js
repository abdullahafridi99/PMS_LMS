const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/logs/email
// @desc    Retrieve system dispatched email notification logs
// @access  Private (Admin only)
router.get('/email', verifyToken, isAdmin, async (req, res) => {
  try {
    const list = await dbService.emailLogs.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/logs/audit
// @desc    Retrieve administration actions audit trail
// @access  Private (Admin only)
router.get('/audit', verifyToken, isAdmin, async (req, res) => {
  try {
    const list = await dbService.auditLogs.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
