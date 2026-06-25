const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth');

// @route   GET /api/goals
// @desc    Get all user goals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await Goal.find({ userId }).sort({ targetDate: 1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    console.error('Fetch goals error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching goals' });
  }
});

// @route   POST /api/goals
// @desc    Create a saving goal
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { targetAmount, targetDate, currentSaved } = req.body;

    if (!targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: 'Target amount and date are required' });
    }

    const goal = new Goal({
      userId: req.user.id,
      targetAmount: Number(targetAmount),
      targetDate: new Date(targetDate),
      currentSaved: currentSaved ? Number(currentSaved) : 0
    });

    const savedGoal = await goal.save();
    res.status(201).json({ success: true, data: savedGoal });
  } catch (error) {
    console.error('Create goal error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating goal' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a saving goal
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { targetAmount, targetDate, currentSaved } = req.body;
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Saving goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this resource' });
    }

    const updates = {};
    if (targetAmount !== undefined) updates.targetAmount = Number(targetAmount);
    if (targetDate) updates.targetDate = new Date(targetDate);
    if (currentSaved !== undefined) updates.currentSaved = Number(currentSaved);

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json({ success: true, data: goal });
  } catch (error) {
    console.error('Update goal error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating saving goal' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a saving goal
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Saving goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this resource' });
    }

    await goal.deleteOne();
    res.json({ success: true, message: 'Saving goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting saving goal' });
  }
});

module.exports = router;
