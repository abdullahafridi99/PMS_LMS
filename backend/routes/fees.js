const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { socketEmitService } = require('../sockets/socketHandler');

// @route   GET api/fees
// @desc    Get all fee invoices (can filter by status/month/studentId)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) filter.month = req.query.month;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      if (req.user.role === 'student') {
        filter.studentId = req.user.id;
      } else if (req.user.role === 'parent') {
        const parent = await dbService.users.findById(req.user.id);
        const childrenEmails = parent ? (parent.childrenEmails || []) : [];
        const children = await dbService.users.find({ email: { $in: childrenEmails } });
        const childrenIds = children.map(c => c._id || c.id);
        
        const allInvoices = await dbService.fees.find({});
        const parentInvoices = allInvoices.filter(inv => childrenIds.includes(String(inv.studentId)));
        return res.json(parentInvoices);
      }
    }

    const invoices = await dbService.fees.find(filter);
    
    // Auto-calculate fine if past due date and unpaid
    const updatedInvoices = invoices.map(inv => {
      if (inv.status === 'unpaid' && inv.dueDate) {
        const today = new Date();
        const due = new Date(inv.dueDate);
        if (today > due) {
          const daysLate = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          const lateFine = daysLate * 50; // 50 PKR fine per day late
          return {
            ...inv,
            amount: inv.amount + lateFine,
            fineApplied: lateFine
          };
        }
      }
      return inv;
    });

    res.json(updatedInvoices);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/fees
// @desc    Generate a single student fee invoice
// @access  Private (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { studentId, month, dueDate, feeType, breakdown } = req.body;

  if (!studentId || !month || !dueDate || !breakdown) {
    return res.status(400).json({ message: 'Please provide studentId, month, dueDate and breakdown' });
  }

  const { tuition = 0, transport = 0, exam = 0, library = 0 } = breakdown;
  const totalAmount = Number(tuition) + Number(transport) + Number(exam) + Number(library);

  try {
    const student = await dbService.users.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const selectedFeeType = feeType || 'tuition';
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
      amount: totalAmount,
      status: 'unpaid',
      feeType: selectedFeeType,
      dueDate,
      breakdown: { tuition, transport, exam, library }
    });

    // Notify student and parent via Socket.IO
    socketEmitService.notifyUser(studentId, 'billing_alert', { invoice });
    if (student.parentEmail) {
      const parent = await dbService.users.findOne({ email: student.parentEmail, role: 'parent' });
      if (parent) {
        socketEmitService.notifyUser(parent._id || parent.id, 'billing_alert', { invoice, studentName: student.name });
      }
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error('Error creating fee invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/fees/bulk
// @desc    Generate fee invoices in bulk by class
// @access  Private (Admin only)
router.post('/bulk', verifyToken, isAdmin, async (req, res) => {
  const { class: className, month, dueDate, breakdown } = req.body;

  if (!className || !month || !dueDate || !breakdown) {
    return res.status(400).json({ message: 'Please provide class, month, dueDate, and breakdown' });
  }

  const { tuition = 0, transport = 0, exam = 0, library = 0 } = breakdown;
  const totalAmount = Number(tuition) + Number(transport) + Number(exam) + Number(library);

  try {
    const students = await dbService.users.find({ role: 'student', class: className });
    if (students.length === 0) {
      return res.status(400).json({ message: `No active students found in class: ${className}` });
    }

    const createdInvoices = [];
    for (const student of students) {
      const existing = await dbService.fees.find({ studentId: student._id || student.id, month, feeType: 'tuition' });
      if (existing.length === 0) {
        const invoice = await dbService.fees.create({
          studentId: student._id || student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          class: className,
          month,
          amount: totalAmount,
          status: 'unpaid',
          feeType: 'tuition',
          dueDate,
          breakdown: { tuition, transport, exam, library }
        });
        createdInvoices.push(invoice);

        // Socket Alerts
        socketEmitService.notifyUser(student._id || student.id, 'billing_alert', { invoice });
      }
    }

    // Log admin action to Audit collection
    await dbService.auditLogs.create({
      action: 'BULK_BILLING_GENERATION',
      details: `Generated ${createdInvoices.length} invoices for class ${className} for ${month}`,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.json({ message: `Successfully generated ${createdInvoices.length} fee invoices in bulk.`, invoices: createdInvoices });
  } catch (err) {
    console.error('Error generating bulk invoices:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/fees/:id/pay
// @desc    Simulate paying a fee invoice
// @access  Private (Students or Parents can pay)
router.put('/:id/pay', verifyToken, async (req, res) => {
  const { paymentMethodUsed } = req.body;

  try {
    const invoiceList = await dbService.fees.find({ _id: req.params.id });
    const singleInvoice = invoiceList && invoiceList[0];
    
    if (!singleInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const updated = await dbService.fees.findByIdAndUpdate(req.params.id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethodUsed: paymentMethodUsed || 'online'
    });

    // Notify admins in real-time
    socketEmitService.notifyRole('admin', 'fee_payment_alert', {
      studentName: singleInvoice.studentName,
      amount: singleInvoice.amount,
      month: singleInvoice.month,
      paymentMethod: paymentMethodUsed
    });

    // Log Audit action
    await dbService.auditLogs.create({
      action: 'FEE_PAYMENT',
      details: `Paid invoice for ${singleInvoice.studentName} amount PKR ${singleInvoice.amount} via ${paymentMethodUsed}`,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.json({ message: 'Invoice successfully paid!', invoice: updated });
  } catch (err) {
    console.error('Error paying invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
