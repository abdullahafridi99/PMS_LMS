const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken } = require('../middleware/auth');

// @route   GET api/inventory
// @desc    Get inventory lists
// @access  Private (Admin/Teachers)
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const list = await dbService.inventory.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/inventory
// @desc    Add item stock details (Admin only)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { name, quantity, category } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Requires Admin permissions' });
  }

  if (!name || quantity === undefined) {
    return res.status(400).json({ message: 'Name and quantity are required' });
  }

  try {
    const item = await dbService.inventory.create({
      name,
      quantity: Number(quantity),
      category: category || 'other',
      lastUpdated: new Date()
    });

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'INVENTORY_ADD',
      details: `Added inventory item ${name} (Stock: ${quantity})`,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/inventory/:id
// @desc    Modify item stock details (Admin/Teacher)
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
  const { quantity } = req.body;

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (quantity === undefined) {
    return res.status(400).json({ message: 'Quantity is required' });
  }

  try {
    const item = await dbService.inventory.findByIdAndUpdate(req.params.id, {
      quantity: Number(quantity),
      lastUpdated: new Date()
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
