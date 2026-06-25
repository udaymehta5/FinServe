const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

// @route   POST /api/chat
// @desc    Interact with AI CFO Chatbot powered by Groq Llama 3.3 70b
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { messages } = req.body; // Array of message objects { role: 'user'/'assistant', content: '...' }
    const userId = req.user.id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Please provide messages array' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'Groq API Key is not configured on the server' });
    }

    // 1. Gather all user context to feed the AI model
    const user = await User.findById(userId);
    const incomes = await Income.find({ userId }).sort({ date: -1 }).limit(10);
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(10);
    const goals = await Goal.find({ userId });

    const totalIncomeRec = await Income.find({ userId });
    const totalExpenseRec = await Expense.find({ userId });

    const sumIncome = totalIncomeRec.reduce((sum, item) => sum + item.amount, 0);
    const sumExpense = totalExpenseRec.reduce((sum, item) => sum + item.amount, 0);
    const netSavings = sumIncome - sumExpense;

    // Group expenses by category for AI overview
    const categoriesMap = {};
    totalExpenseRec.forEach(exp => {
      categoriesMap[exp.category] = (categoriesMap[exp.category] || 0) + exp.amount;
    });

    const categoryBreakdown = Object.entries(categoriesMap)
      .map(([cat, amt]) => `${cat}: INR ${amt}`)
      .join(', ');

    // active goals overview
    const goalsOverview = goals
      .map(g => `- Target: INR ${g.targetAmount}, Saved: INR ${g.currentSaved}, Date: ${new Date(g.targetDate).toLocaleDateString()}`)
      .join('\n');

    // Recent transaction lists
    const recentExpenses = expenses
      .map(e => `- ${new Date(e.date).toLocaleDateString()}: INR ${e.amount} on ${e.category} (${e.description || 'No desc'})`)
      .join('\n');
    const recentIncomes = incomes
      .map(i => `- ${new Date(i.date).toLocaleDateString()}: INR ${i.amount} from ${i.source}`)
      .join('\n');

    // 2. Build AI Context Injection
    const systemPrompt = `You are FinServe AI CFO. Analyze user spending, savings and financial habits. Use available database information before responding. Give budgeting and financial planning suggestions. Never provide investment advice.

--- USER FINANCIAL PROFILE & CONTEXT ---
User Name: ${user.name}
User Stated Monthly Income: INR ${user.monthlyIncome}
Stated Financial Goal Budget: INR ${user.financialGoal}

Total Income Recorded: INR ${sumIncome}
Total Expenses Recorded: INR ${sumExpense}
Net Savings Buffer: INR ${netSavings}

Category Spending Breakdown:
${categoryBreakdown || 'No expenses logged yet.'}

Active Financial Goals:
${goalsOverview || 'No saving goals set.'}

Recent Expenses Logged:
${recentExpenses || 'No recent expenses.'}

Recent Incomes Logged:
${recentIncomes || 'No recent incomes.'}
----------------------------------------

Always respond in a professional, polite, and helpful manner. Avoid vague suggestions, utilize the numbers above to give specific budget calculations. Keep your answers concise, structured, and action-oriented. Do not give any stock, crypto, or investment tips.`;

    // 3. Request Groq API
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Combine context system message with user messages
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024
    });

    const reply = completion.choices[0].message.content;

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Groq AI CFO Chat Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing CFO Chat response' });
  }
});

// @route   POST /api/chat/affordability
// @desc    Determine if the user can afford a specific item
// @access  Private
router.post('/affordability', protect, async (req, res) => {
  try {
    const { itemName, itemCost } = req.body;
    const userId = req.user.id;

    if (!itemName || !itemCost || isNaN(Number(itemCost))) {
      return res.status(400).json({ success: false, message: 'Please provide item name and a valid item cost' });
    }

    const cost = Number(itemCost);
    const user = await User.findById(userId);

    // Fetch incomes and expenses
    const incomes = await Income.find({ userId });
    const expenses = await Expense.find({ userId });

    const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const currentSavings = totalIncome - totalExpense;

    // Calculate historical monthly income and expenses to determine saving capability
    const monthlySavingsMap = {};
    incomes.forEach(inc => {
      const date = new Date(inc.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlySavingsMap[key] = (monthlySavingsMap[key] || 0) + inc.amount;
    });
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlySavingsMap[key] = (monthlySavingsMap[key] || 0) - exp.amount;
    });

    const monthsCount = Object.keys(monthlySavingsMap).length;
    let avgMonthlySavings = 0;

    if (monthsCount > 0) {
      const totalSavings = Object.values(monthlySavingsMap).reduce((a, b) => a + b, 0);
      avgMonthlySavings = totalSavings / monthsCount;
    } else {
      // Fallback
      avgMonthlySavings = (user.monthlyIncome || 0) * 0.25; // assume 25% savings capability
    }

    // 1. Calculate recovery months
    const recoveryMonths = avgMonthlySavings > 0 ? Math.ceil(cost / avgMonthlySavings) : 99;

    // 2. Compute Affordability Score (0-100)
    let affordabilityScore = 0;

    // a. Savings buffer score (40 points max)
    let bufferScore = 0;
    if (currentSavings >= cost) {
      bufferScore = 40;
    } else if (currentSavings > 0) {
      bufferScore = Math.round((currentSavings / cost) * 40);
    }

    // b. Recovery velocity score (60 points max)
    let recoveryScore = 0;
    if (recoveryMonths <= 1) {
      recoveryScore = 60;
    } else if (recoveryMonths <= 3) {
      recoveryScore = 45;
    } else if (recoveryMonths <= 6) {
      recoveryScore = 30;
    } else if (recoveryMonths <= 12) {
      recoveryScore = 15;
    } else {
      recoveryScore = 5;
    }

    affordabilityScore = bufferScore + recoveryScore;
    affordabilityScore = Math.max(10, Math.min(100, affordabilityScore));

    // 3. Impact Analysis details
    const percentageOfTotalSavings = currentSavings > 0 ? ((cost / currentSavings) * 100).toFixed(1) : 'infinite';
    
    let impactAnalysis = '';
    if (currentSavings >= cost) {
      impactAnalysis = `This item will consume ${percentageOfTotalSavings}% of your current net savings of INR ${currentSavings}. It will take approximately ${recoveryMonths} month(s) of regular savings to rebuild this capital back to your current levels.`;
    } else {
      const deficit = cost - currentSavings;
      impactAnalysis = `You have a savings deficit of INR ${deficit} to purchase this item outright. Buying this now would require borrowing or drawing into essential funds. You will need ${recoveryMonths} month(s) of savings to afford it comfortably.`;
    }

    // 4. Recommendation text
    let recommendation = '';
    if (affordabilityScore >= 80) {
      recommendation = `Highly Affordable: You can purchase the ${itemName} immediately. Your savings cushion is solid, and you'll recover the expenditure in under a month.`;
    } else if (affordabilityScore >= 60) {
      recommendation = `Affordable: You can purchase the ${itemName}, but plan to trim luxury/discretionary expenditures for the next few weeks to recover your cushion faster.`;
    } else if (affordabilityScore >= 40) {
      recommendation = `Caution: Buying ${itemName} is possible but risky. It takes a heavy toll on your savings. Consider waiting ${Math.min(3, recoveryMonths)} months to accumulate half the cost first.`;
    } else {
      recommendation = `Not Recommended: The cost of ${itemName} is too high relative to your income and savings. We recommend holding off until your savings rate improves or looking for budget alternatives.`;
    }

    res.json({
      success: true,
      data: {
        itemName,
        itemCost: cost,
        affordabilityScore,
        recoveryMonths: avgMonthlySavings > 0 ? recoveryMonths : 'Indefinite',
        impactAnalysis,
        recommendation
      }
    });
  } catch (error) {
    console.error('Affordability check error:', error.message);
    res.status(500).json({ success: false, message: 'Server error calculating affordability' });
  }
});

module.exports = router;
