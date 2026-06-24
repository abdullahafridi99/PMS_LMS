const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/notices
// @desc    Get notices (filtered by targetAudience depending on user role)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    
    // If not Admin, restrict based on role
    if (req.user.role === 'student') {
      query.targetAudience = { $in: ['all', 'students'] };
    } else if (req.user.role === 'parent') {
      query.targetAudience = { $in: ['all', 'parents'] };
    }

    const notices = await dbService.notices.find({});
    
    // Perform filtering manually if local JSON mode is running, Mongoose takes care otherwise
    if (!dbService.isMongo()) {
      const filtered = notices.filter(n => {
        if (req.user.role === 'admin') return true;
        if (req.user.role === 'student') return n.targetAudience === 'all' || n.targetAudience === 'students';
        if (req.user.role === 'parent') return n.targetAudience === 'all' || n.targetAudience === 'parents';
        return false;
      });
      return res.json(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    res.json(notices);
  } catch (err) {
    console.error('Error fetching notices:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/notices
// @desc    Create a new announcement notice
// @access  Private (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { title, content, targetAudience } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Please provide title and content' });
  }

  try {
    const newNotice = await dbService.notices.create({
      title,
      content,
      targetAudience: targetAudience || 'all',
      createdBy: req.user.name || 'Admin',
      date: new Date().toISOString()
    });

    // Trigger parent SMS notifications if targeted to parents or everyone
    if (newNotice.targetAudience === 'all' || newNotice.targetAudience === 'parents') {
      triggerNoticeSmsBroadcast(newNotice.title, newNotice.content);
    }

    res.status(201).json(newNotice);
  } catch (err) {
    console.error('Error creating notice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/notices/:id
// @desc    Delete a notice
// @access  Private (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await dbService.notices.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ message: 'Notice deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting notice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to broadcast SMS to parents when announcements are posted
const triggerNoticeSmsBroadcast = async (title, content) => {
  try {
    const parents = await dbService.users.find({ role: 'parent' });
    for (let parent of parents) {
      const parentName = parent.name || 'Parent';
      const parentPhone = parent.phone || '+92 300 1234567';
      const message = `School Announcement: [${title}] - ${content}`;
      
      await dbService.smsLogs.create({
        recipient: parentName,
        phone: parentPhone,
        message,
        type: 'notice_broadcast'
      });
    }
    console.log(`[SMS Sentinel] Dispatched notices alert to ${parents.length} parents`);
  } catch (err) {
    console.error('Error broadcasting notice SMS alert:', err);
  }
};

module.exports = router;
