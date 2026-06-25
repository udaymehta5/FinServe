const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper for linear regression calculation
function calculateLinearRegression(data) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumXX += data[i].x * data[i].x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    // If all X values are the same, return average as intercept and 0 slope
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// @route   GET /api/predict-budget
// @desc    Calculate next month spending, expected savings, and risk levels
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Fetch all expenses and incomes
    const expenses = await Expense.find({ userId });
    const incomes = await Income.find({ userId });

    // Group expenses by Month-Year (YYYY-MM)
    const monthlyExpensesMap = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpensesMap[monthKey] = (monthlyExpensesMap[monthKey] || 0) + exp.amount;
    });

    // Group incomes by Month-Year (YYYY-MM)
    const monthlyIncomesMap = {};
    incomes.forEach(inc => {
      const date = new Date(inc.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyIncomesMap[monthKey] = (monthlyIncomesMap[monthKey] || 0) + inc.amount;
    });

    const months = Object.keys(monthlyExpensesMap).sort();
    const N = months.length;

    let predictedSpending = 0;
    let regressionProjection = 0;
    let movingAverageProjection = 0;

    if (N === 0) {
      predictedSpending = 0;
    } else if (N === 1) {
      predictedSpending = monthlyExpensesMap[months[0]];
      regressionProjection = predictedSpending;
      movingAverageProjection = predictedSpending;
    } else {
      // 1. Moving Average of last 3 months (or available months)
      const maMonths = months.slice(-3);
      const maSum = maMonths.reduce((acc, m) => acc + monthlyExpensesMap[m], 0);
      movingAverageProjection = maSum / maMonths.length;

      // 2. Linear Regression over all historical months
      // Represent month index as X (1 to N), total spending as Y
      const regressionData = months.map((month, idx) => ({
        x: idx + 1,
        y: monthlyExpensesMap[month]
      }));

      const { slope, intercept } = calculateLinearRegression(regressionData);
      
      // Predict for next month (index N + 1)
      regressionProjection = slope * (N + 1) + intercept;
      // In case slope is highly negative resulting in below zero projection
      if (regressionProjection < 0) regressionProjection = 0;

      // Combined Prediction (Weighted: 60% Linear Regression, 40% Moving Average)
      predictedSpending = 0.6 * regressionProjection + 0.4 * movingAverageProjection;
    }

    // Determine target monthly income
    // Fall back to: user.monthlyIncome -> then average of historical incomes -> then 0
    let monthlyIncomeVal = user.monthlyIncome || 0;
    if (monthlyIncomeVal === 0) {
      const incomeMonths = Object.keys(monthlyIncomesMap);
      if (incomeMonths.length > 0) {
        const sumIncomes = Object.values(monthlyIncomesMap).reduce((a, b) => a + b, 0);
        monthlyIncomeVal = sumIncomes / incomeMonths.length;
      }
    }

    const expectedSavings = Math.max(0, monthlyIncomeVal - predictedSpending);
    
    // Risk level calculations
    let riskLevel = 'Low';
    let riskFactor = 0;
    if (monthlyIncomeVal > 0) {
      riskFactor = predictedSpending / monthlyIncomeVal;
      if (riskFactor >= 1.0) {
        riskLevel = 'High';
      } else if (riskFactor >= 0.8) {
        riskLevel = 'Medium';
      } else {
        riskLevel = 'Low';
      }
    } else if (predictedSpending > 0) {
      riskLevel = 'High'; // High spending with no income
    }

    res.json({
      success: true,
      data: {
        predictedSpending: Math.round(predictedSpending),
        regressionProjection: Math.round(regressionProjection),
        movingAverageProjection: Math.round(movingAverageProjection),
        expectedSavings: Math.round(expectedSavings),
        monthlyIncomeVal: Math.round(monthlyIncomeVal),
        riskLevel,
        monthsAnalysed: N
      }
    });
  } catch (error) {
    console.error('Predict budget error:', error.message);
    res.status(500).json({ success: false, message: 'Server error computing budget predictions' });
  }
});

module.exports = router;
