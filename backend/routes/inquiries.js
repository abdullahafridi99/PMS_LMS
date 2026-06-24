const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Helper to validate Pakistani phone numbers
const validatePakistanPhone = (phone) => {
  if (!phone) return false;
  const clean = String(phone).trim().replace(/[-\s]/g, '');
  // Matches 03xxxxxxxxx (11 digits) or +923xxxxxxxxx (13 chars) or 00923xxxxxxxxx / 923xxxxxxxxx
  const regex = /^((\+92)|(0092)|(92))?3\d{9}$|^03\d{9}$/;
  return regex.test(clean);
};

// @route   POST api/inquiries
// @desc    Submit a new student admission inquiry inquiry
// @access  Public
router.post('/', async (req, res) => {
  const { studentName, grade, parentName, phone, email, address } = req.body;

  if (!studentName || !grade || !parentName || !phone) {
    return res.status(400).json({ message: 'Please enter student name, grade, parent name, and contact phone number.' });
  }

  if (!validatePakistanPhone(phone)) {
    return res.status(400).json({ 
      message: 'Invalid phone number. Must be a valid Pakistani mobile phone number (e.g., 03001234567 or +923001234567).' 
    });
  }

  try {
    const newInquiry = await dbService.inquiries.create({
      studentName,
      grade,
      parentName,
      phone,
      email: email || '',
      address: address || '',
      status: 'pending',
      date: new Date()
    });

    res.status(201).json(newInquiry);
  } catch (err) {
    console.error('Error creating admission inquiry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/inquiries
// @desc    Get all admission inquiries
// @access  Private (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const inquiries = await dbService.inquiries.find({});
    res.json(inquiries);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/inquiries/:id
// @desc    Resolve/Delete an admission inquiry
// @access  Private (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dbService.inquiries.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry successfully resolved and cleared', deleted });
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
