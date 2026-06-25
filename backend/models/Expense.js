const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    enum: [
      'Food',
      'Shopping',
      'Travel',
      'Bills',
      'Entertainment',
      'Healthcare',
      'Education',
      'Investment',
      'Other'
    ],
    required: [true, 'Please specify a category']
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
