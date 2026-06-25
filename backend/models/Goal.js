const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please select a target date']
  },
  currentSaved: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Goal', GoalSchema);
