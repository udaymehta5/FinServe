const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/forecast
// @desc    Calculate savings requirements, goal probability, and monthly projection values
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { targetAmount, targetDate, currentSaved } = req.body;
    const userId = req.user.id;

    if (!targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: 'Please provide target amount and target date' });
    }

    const targetAmt = Number(targetAmount);
    const targetDt = new Date(targetDate);
    const currentSavedAmt = currentSaved ? Number(currentSaved) : 0;
    const now = new Date();

    if (targetDt <= now) {
      return res.status(400).json({ success: false, message: 'Target date must be in the future' });
    }

    // 1. Calculate number of months between now and target date
    const diffTime = Math.abs(targetDt - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const monthsRemaining = Math.max(1, Math.round(diffDays / 30));

    // 2. Calculate monthly amount required
    const remainingAmount = Math.max(0, targetAmt - currentSavedAmt);
    const monthlyRequired = Math.round(remainingAmount / monthsRemaining);

    // 3. Compute historical monthly savings rate
    const incomes = await Income.find({ userId });
    const expenses = await Expense.find({ userId });
    const user = await User.findById(userId);

    const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    
    // Group monthly for averaging
    const monthlySavingsMap = {};
    incomes.forEach(inc => {
      const date = new Date(inc.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlySavingsMap[key]) monthlySavingsMap[key] = 0;
      monthlySavingsMap[key] += inc.amount;
    });
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlySavingsMap[key]) monthlySavingsMap[key] = 0;
      monthlySavingsMap[key] -= exp.amount;
    });

    const activeMonths = Object.keys(monthlySavingsMap);
    let avgMonthlySavings = 0;

    if (activeMonths.length > 0) {
      const totalSavingsHistory = Object.values(monthlySavingsMap).reduce((a, b) => a + b, 0);
      avgMonthlySavings = totalSavingsHistory / activeMonths.length;
    } else {
      // Fallback to profile monthlyIncome minus some default expense ratio (e.g. 70% burn rate)
      avgMonthlySavings = (user.monthlyIncome || 0) * 0.3;
    }

    // 4. Calculate Goal Probability (0-100%)
    let probability = 50; // default medium if no data
    if (remainingAmount === 0) {
      probability = 100;
    } else if (avgMonthlySavings <= 0) {
      probability = Math.min(15, Math.round((currentSavedAmt / targetAmt) * 100)); // Very low if not actively saving
    } else {
      const ratio = avgMonthlySavings / monthlyRequired;
      if (ratio >= 1.0) {
        // High probability if history supports it
        probability = Math.min(98, Math.round(85 + (ratio - 1.0) * 10));
      } else {
        // Linear scale for lesser savings capability
        probability = Math.max(10, Math.round(ratio * 80));
      }
    }

    // 5. Generate Forecast graph data
    const forecastGraph = [];
    let currentProjected = currentSavedAmt;
    let targetLinearStep = currentSavedAmt;

    const linearIncrement = remainingAmount / monthsRemaining;

    for (let i = 0; i <= monthsRemaining; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = forecastDate.toLocaleString('default', { month: 'short', year: '2-digit' });

      forecastGraph.push({
        month: monthLabel,
        projectedSavings: Math.round(currentProjected),
        targetRequired: Math.round(targetLinearStep)
      });

      // Increment for next iteration
      currentProjected += Math.max(0, avgMonthlySavings);
      targetLinearStep += linearIncrement;
    }

    res.json({
      success: true,
      data: {
        monthsRemaining,
        monthlyRequired,
        probability,
        avgMonthlySavings: Math.round(avgMonthlySavings),
        remainingAmount,
        forecastGraph
      }
    });
  } catch (error) {
    console.error('Forecast savings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating savings forecast' });
  }
});

module.exports = router;
