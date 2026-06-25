const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all user expenses with search and filter
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, search, startDate, endDate } = req.query;

    const query = { userId };

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply description search (case-insensitive regex)
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    // Apply date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of that day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    console.error('Fetch expenses error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
});

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ success: false, message: 'Amount and category are required' });
    }

    const newExpense = new Expense({
      userId: req.user.id,
      amount: Number(amount),
      category,
      description,
      date: date ? new Date(date) : new Date()
    });

    const expense = await newExpense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('Create expense error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving expense' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Check user ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this resource' });
    }

    const updates = {};
    if (amount !== undefined) updates.amount = Number(amount);
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = new Date(date);

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Update expense error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating expense' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Check user ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this resource' });
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
});

module.exports = router;
