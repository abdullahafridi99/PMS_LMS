const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/settings
// @desc    Get public school settings (landing page details)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await dbService.settings.findOne({ key: 'landing_page' });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/settings
// @desc    Update school settings
// @access  Private (Admin only)
router.put('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // Validate staff member phone numbers
    if (req.body.staffList && Array.isArray(req.body.staffList)) {
      const phoneRegex = /^((\+92)|(0092)|(92))?3\d{9}$|^03\d{9}$/;
      for (const staff of req.body.staffList) {
        if (staff.phone) {
          const clean = String(staff.phone).trim().replace(/[-\s]/g, '');
          if (!phoneRegex.test(clean)) {
            return res.status(400).json({ 
              message: `Invalid contact phone number format for staff member "${staff.name || 'Unnamed'}". Must be a valid Pakistani mobile number.` 
            });
          }
        }
      }
    }

    const settings = await dbService.settings.findOneAndUpdate({ key: 'landing_page' }, req.body);
    res.json(settings);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
