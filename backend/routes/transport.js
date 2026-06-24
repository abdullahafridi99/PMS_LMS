const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/transport
// @desc    Get all bus routes
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const routes = await dbService.transport.find({});
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/transport
// @desc    Add transport route details (Admin only)
// @access  Private
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { routeName, driverName, driverPhone, vehicleNumber, pickupPoints } = req.body;

  if (!routeName || !driverName || !driverPhone || !vehicleNumber) {
    return res.status(400).json({ message: 'RouteName, driverName, driverPhone, and vehicleNumber are required' });
  }

  try {
    const route = await dbService.transport.create({
      routeName,
      driverName,
      driverPhone,
      vehicleNumber,
      pickupPoints: pickupPoints || []
    });

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'TRANSPORT_ADD',
      details: `Added bus route ${routeName} with vehicle ${vehicleNumber}`,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
