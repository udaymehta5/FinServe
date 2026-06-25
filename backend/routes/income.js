const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const { protect } = require('../middleware/auth');

// @route   GET /api/income
// @desc    Get all user incomes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    res.json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    console.error('Fetch income error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching income data' });
  }
});

// @route   POST /api/income
// @desc    Create a new income record
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { amount, source, date } = req.body;

    if (!amount || !source) {
      return res.status(400).json({ success: false, message: 'Amount and source are required' });
    }

    const newIncome = new Income({
      userId: req.user.id,
      amount: Number(amount),
      source,
      date: date ? new Date(date) : new Date()
    });

    const income = await newIncome.save();
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    console.error('Create income error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving income record' });
  }
});

// @route   PUT /api/income/:id
// @desc    Update an income record
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { amount, source, date } = req.body;
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    // Check ownership
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this resource' });
    }

    const updates = {};
    if (amount !== undefined) updates.amount = Number(amount);
    if (source) updates.source = source;
    if (date) updates.date = new Date(date);

    income = await Income.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json({ success: true, data: income });
  } catch (error) {
    console.error('Update income error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating income record' });
  }
});

// @route   DELETE /api/income/:id
// @desc    Delete an income record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    // Check ownership
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this resource' });
    }

    await income.deleteOne();
    res.json({ success: true, message: 'Income record deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting income record' });
  }
});

module.exports = router;
