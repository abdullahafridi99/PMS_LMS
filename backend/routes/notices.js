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

module.exports = router;
