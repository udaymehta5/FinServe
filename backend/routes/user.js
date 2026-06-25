const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

// @route   GET /api/user
// @desc    Get user profile data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
});

// @route   PUT /api/user
// @desc    Update user profile data
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { name, email, password, monthlyIncome, financialGoal } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (monthlyIncome !== undefined) user.monthlyIncome = Number(monthlyIncome);
    if (financialGoal !== undefined) user.financialGoal = Number(financialGoal);

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password; // Trigger hashing pre-save hook
    }

    await user.save();

    // Exclude password from response
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating user profile' });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get aggregated dashboard stats and charts
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details for monthly income & financial goal
    const user = await User.findById(userId);

    // Fetch all incomes and expenses for this user
    const incomes = await Income.find({ userId });
    const expenses = await Expense.find({ userId });
    const goals = await Goal.find({ userId });

    // 1. Calculations
    const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const currentSavings = totalIncome - totalExpense;
    
    const savingsRate = totalIncome > 0 ? (currentSavings / totalIncome) * 100 : 0;

    // Calculate Burn Rate (Expenses in the current calendar month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
    const burnRate = currentMonthExpenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 2. Financial Health Score (0-100)
    let healthScore = 50; // Neutral start
    let scoreExplanation = 'Neutral starting point. Add more income or savings data to improve.';

    if (totalIncome > 0) {
      // Components
      // a. Savings rate (40 points max)
      const savingsRateScore = Math.max(0, Math.min(40, (savingsRate / 40) * 40)); // 40% or more savings rate gets max score

      // b. Expense to Income ratio (30 points max)
      const ratio = totalExpense / totalIncome;
      let ratioScore = 0;
      if (ratio <= 0.5) {
        ratioScore = 30;
      } else if (ratio < 1) {
        ratioScore = Math.round((1 - ratio) * 2 * 30);
      } else {
        ratioScore = 0;
      }

      // c. Budget Consistency: Compare total expenses with static monthly income (30 points max)
      let budgetScore = 30;
      const expectedMonthlyIncome = user.monthlyIncome || totalIncome;
      if (expectedMonthlyIncome > 0) {
        const monthlyRatio = burnRate / expectedMonthlyIncome;
        if (monthlyRatio > 1.0) {
          budgetScore = Math.max(0, Math.round(30 - (monthlyRatio - 1.0) * 50)); // Penalize for overspending
        } else if (monthlyRatio > 0.8) {
          budgetScore = 20; // Warnings
        }
      }

      healthScore = Math.round(savingsRateScore + ratioScore + budgetScore);
      healthScore = Math.max(0, Math.min(100, healthScore));

      // Explanation
      if (healthScore >= 85) {
        scoreExplanation = 'Excellent: Outstanding savings rate, controlled expenditures, and clear budget consistency.';
      } else if (healthScore >= 70) {
        scoreExplanation = 'Good: Stable financial buffers with standard savings. Keep optimizing expenses to hit excellent.';
      } else if (healthScore >= 50) {
        scoreExplanation = 'Average: Savings rate is moderate. Consider decreasing discretionary spending.';
      } else if (healthScore >= 30) {
        scoreExplanation = 'Poor: Expenses consume most of your income. High risk of saving deficit.';
      } else {
        scoreExplanation = 'Critical: High burn rate exceeds income levels. Budget adjustment and cutting non-essentials is highly recommended.';
      }
    } else if (totalExpense > 0) {
      healthScore = 15;
      scoreExplanation = 'Critical: Expenses logged with zero reported income.';
    }

    let healthLabel = 'Average';
    if (healthScore >= 85) healthLabel = 'Excellent';
    else if (healthScore >= 70) healthLabel = 'Good';
    else if (healthScore >= 50) healthLabel = 'Average';
    else if (healthScore >= 30) healthLabel = 'Poor';
    else healthLabel = 'Critical';

    // 3. Prepare data for Recharts (Dashboard visual reports)
    
    // Group Expense Trend by date (last 7 entries or group by date)
    // For simplicity and quality, we sort and group expenses by date (YYYY-MM-DD)
    const expenseTrendMap = {};
    expenses.forEach(e => {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      expenseTrendMap[dateStr] = (expenseTrendMap[dateStr] || 0) + e.amount;
    });
    const expenseTrend = Object.keys(expenseTrendMap)
      .sort()
      .slice(-10) // Limit to last 10 days of entries
      .map(date => ({ date, amount: expenseTrendMap[date] }));

    // Group spending by category
    const categoryMap = {};
    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    const spendingCategories = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));

    // Income vs Expense (Grouped monthly or past transactions)
    // We group by month-year
    const monthlyDataMap = {};
    incomes.forEach(i => {
      const monthYear = new Date(i.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyDataMap[monthYear]) monthlyDataMap[monthYear] = { month: monthYear, income: 0, expense: 0 };
      monthlyDataMap[monthYear].income += i.amount;
    });
    expenses.forEach(e => {
      const monthYear = new Date(e.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyDataMap[monthYear]) monthlyDataMap[monthYear] = { month: monthYear, income: 0, expense: 0 };
      monthlyDataMap[monthYear].expense += e.amount;
    });

    const incomeVsExpense = Object.values(monthlyDataMap)
      .sort((a, b) => {
        // Sort chronologically
        const parseDate = (str) => new Date(Date.parse(`01 ${str}`));
        return parseDate(a.month) - parseDate(b.month);
      })
      .slice(-6); // Limit to last 6 months

    res.json({
      success: true,
      stats: {
        totalIncome,
        totalExpense,
        currentSavings,
        savingsRate,
        burnRate,
        healthScore: {
          score: healthScore,
          label: healthLabel,
          explanation: scoreExplanation
        }
      },
      charts: {
        expenseTrend,
        spendingCategories,
        incomeVsExpense
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error compiling dashboard details' });
  }
});

module.exports = router;
