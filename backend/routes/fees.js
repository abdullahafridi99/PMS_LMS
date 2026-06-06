const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET api/fees
// @desc    Get all fee invoices (can filter by status/month/studentId)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) filter.month = req.query.month;

    // Authorization check: Students and Parents can only filter by their own studentId
    if (req.user.role !== 'admin') {
      if (req.user.role === 'student') {
        filter.studentId = req.user.id;
      } else if (req.user.role === 'parent') {
        // If parent, check if requested student belongs to parent
        if (req.query.studentId) {
          const parent = await dbService.users.findById(req.user.id);
          const child = await dbService.users.findById(req.query.studentId);
          if (!parent || !child || !parent.childrenEmails.includes(child.email)) {
            return res.status(403).json({ message: 'Unauthorized access to student fee invoices' });
          }
        } else {
          // If parent fetches without filter, we must limit to their children
          const parent = await dbService.users.findById(req.user.id);
          const childrenEmails = parent.childrenEmails || [];
          const children = await dbService.users.find({ email: { $in: childrenEmails } });
          const childrenIds = children.map(c => c.id || c._id);
          
          const allInvoices = await dbService.fees.find({});
          const parentInvoices = allInvoices.filter(inv => childrenIds.includes(inv.studentId));
          return res.json(parentInvoices);
        }
      }
    }

    const invoices = await dbService.fees.find(filter);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/fees
// @desc    Generate a new fee invoice for a student
// @access  Private (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { studentId, month, amount, dueDate, feeType } = req.body;

  if (!studentId || !month || !amount || !dueDate) {
    return res.status(400).json({ message: 'Please provide studentId, month, amount, and dueDate' });
  }

  const selectedFeeType = feeType || 'tuition';

  try {
    const student = await dbService.users.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if invoice already exists for this student, month and type
    const existing = await dbService.fees.find({ studentId, month, feeType: selectedFeeType });
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: `An invoice of type '${selectedFeeType}' already exists for this student for ${month}` });
    }

    const invoice = await dbService.fees.create({
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      month,
      amount: Number(amount),
      status: 'unpaid',
      feeType: selectedFeeType,
      dueDate
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error('Error creating fee invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/fees/:id/pay
// @desc    Simulate paying a fee invoice
// @access  Private (Students or Parents can pay)
router.put('/:id/pay', verifyToken, async (req, res) => {
  const { paymentMethodUsed } = req.body;

  try {
    const invoice = await dbService.fees.find({ _id: req.params.id });
    const singleInvoice = invoice && invoice[0];
    
    if (!singleInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Auth check
    if (req.user.role !== 'admin' && req.user.role !== 'parent' && req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const updated = await dbService.fees.findByIdAndUpdate(req.params.id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethodUsed: paymentMethodUsed || 'online'
    });

    res.json({ message: 'Invoice successfully paid!', invoice: updated });
  } catch (err) {
    console.error('Error paying invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
