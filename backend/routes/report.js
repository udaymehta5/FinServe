const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

// @route   GET /api/report
// @desc    Generate and download detailed PDF financial report
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Fetch user context
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    const goals = await Goal.find({ userId });

    const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const currentSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((currentSavings / totalIncome) * 100).toFixed(1) : '0.0';

    // Calculate Current Month Burn Rate
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
    const burnRate = currentMonthExpenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Group expenses by category
    const categoryMap = {};
    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    // Re-evaluate Health Score logic (matching dashboard)
    let healthScore = 50;
    if (totalIncome > 0) {
      const savingsRateScore = Math.max(0, Math.min(40, (parseFloat(savingsRate) / 40) * 40));
      const ratio = totalExpense / totalIncome;
      let ratioScore = 0;
      if (ratio <= 0.5) ratioScore = 30;
      else if (ratio < 1) ratioScore = Math.round((1 - ratio) * 2 * 30);
      
      let budgetScore = 30;
      const expectedMonthlyIncome = user.monthlyIncome || totalIncome;
      if (expectedMonthlyIncome > 0) {
        const monthlyRatio = burnRate / expectedMonthlyIncome;
        if (monthlyRatio > 1.0) {
          budgetScore = Math.max(0, Math.round(30 - (monthlyRatio - 1.0) * 50));
        } else if (monthlyRatio > 0.8) {
          budgetScore = 20;
        }
      }
      healthScore = Math.round(savingsRateScore + ratioScore + budgetScore);
      healthScore = Math.max(0, Math.min(100, healthScore));
    } else if (totalExpense > 0) {
      healthScore = 15;
    }

    let healthLabel = 'Average';
    if (healthScore >= 85) healthLabel = 'Excellent';
    else if (healthScore >= 70) healthLabel = 'Good';
    else if (healthScore >= 50) healthLabel = 'Average';
    else if (healthScore >= 30) healthLabel = 'Poor';
    else healthLabel = 'Critical';

    // Formulate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream responses
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=FinServe_CFO_Report_${user.name.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    // Theme Colors
    const primaryColor = '#050505'; // Dark Slate/Black
    const accentColor = '#00D973';  // FinServe Neon Green (safe printing version)
    const textColor = '#1F2937';    // Charcoal Text
    const lightBg = '#F3F4F6';      // Gray background

    // PDF HEADER
    doc.rect(0, 0, 595.28, 120).fill(primaryColor);
    
    // Logo & Brand Name
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .text('FinServe', 50, 40, { lineGap: 4 })
       .fontSize(10)
       .fillColor(accentColor)
       .text('AI PERSONAL CFO STRATEGIC REPORT', 50, 68);

    doc.fillColor('#9CA3AF')
       .fontSize(9)
       .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 45, { align: 'right' })
       .text(`Client: ${user.name}`, 400, 60, { align: 'right' })
       .text(`Stated Monthly Budget: INR ${user.monthlyIncome}`, 400, 75, { align: 'right' });

    doc.moveDown(5);

    // SECTION 1: EXECUTIVE SUMMARY
    doc.fillColor(primaryColor)
       .fontSize(16)
       .text('1. Executive Financial Summary', 50, 150)
       .rect(50, 170, 495.28, 2).fill(accentColor);
    
    doc.moveDown(1.5);

    // Summary details (Grid Layout)
    doc.fontSize(10).fillColor(textColor);
    
    const summaryY = 185;
    // Column 1
    doc.text('Total Income Recorded:', 60, summaryY)
       .font('Helvetica-Bold')
       .text(`INR ${totalIncome.toLocaleString()}`, 200, summaryY)
       .font('Helvetica')
       .text('Total Expenses Recorded:', 60, summaryY + 20)
       .font('Helvetica-Bold')
       .text(`INR ${totalExpense.toLocaleString()}`, 200, summaryY + 20)
       .font('Helvetica')
       .text('Net Savings Cushion:', 60, summaryY + 40)
       .font('Helvetica-Bold')
       .text(`INR ${currentSavings.toLocaleString()}`, 200, summaryY + 40);

    // Column 2
    doc.font('Helvetica')
       .text('Active Savings Rate:', 310, summaryY)
       .font('Helvetica-Bold')
       .text(`${savingsRate}%`, 450, summaryY)
       .font('Helvetica')
       .text('Current Month Burn Rate:', 310, summaryY + 20)
       .font('Helvetica-Bold')
       .text(`INR ${burnRate.toLocaleString()}`, 450, summaryY + 20)
       .font('Helvetica')
       .text('Target Savings Goal:', 310, summaryY + 40)
       .font('Helvetica-Bold')
       .text(`INR ${user.financialGoal.toLocaleString()}`, 450, summaryY + 40);

    // SECTION 2: FINANCIAL HEALTH SCORE
    const healthY = 265;
    doc.fillColor(primaryColor)
       .font('Helvetica')
       .fontSize(16)
       .text('2. Financial Health Analysis', 50, healthY)
       .rect(50, healthY + 20, 495.28, 2).fill(accentColor);

    doc.rect(50, healthY + 30, 495.28, 60).fill(lightBg);
    
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(28)
       .text(`${healthScore}/100`, 70, healthY + 45)
       .fontSize(12)
       .fillColor(healthScore >= 70 ? '#059669' : healthScore >= 45 ? '#D97706' : '#DC2626')
       .text(`Rating: ${healthLabel}`, 200, healthY + 42)
       .fontSize(9.5)
       .fillColor(textColor)
       .font('Helvetica')
       .text('Your Health Score evaluates income stability, expense-to-savings ratios, and budget adherence. A higher score translates to a better financial cushion.', 200, healthY + 60, { width: 330 });

    // SECTION 3: TOP CATEGORIES EXPENSES
    const categoryY = 360;
    doc.fillColor(primaryColor)
       .font('Helvetica')
       .fontSize(16)
       .text('3. Spending Breakdown By Category', 50, categoryY)
       .rect(50, categoryY + 20, 495.28, 2).fill(accentColor);

    doc.moveDown(2);
    
    // Draw Category Table Headers
    const tableHeaderY = categoryY + 32;
    doc.rect(50, tableHeaderY, 495.28, 20).fill(primaryColor);
    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('Category', 60, tableHeaderY + 5)
       .text('Total Spent', 250, tableHeaderY + 5)
       .text('Percentage of Total', 400, tableHeaderY + 5);

    let currentTableY = tableHeaderY + 20;
    doc.font('Helvetica').fillColor(textColor);
    
    const sortedCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
      doc.text('No expenses logged in database yet.', 60, currentTableY + 10);
      currentTableY += 30;
    } else {
      sortedCategories.forEach(([cat, amount], index) => {
        // Alternating background rows
        if (index % 2 === 0) {
          doc.rect(50, currentTableY, 495.28, 20).fill('#F9FAFB');
        }
        
        const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0.0';
        
        doc.fillColor(textColor)
           .text(cat, 60, currentTableY + 5)
           .text(`INR ${amount.toLocaleString()}`, 250, currentTableY + 5)
           .text(`${pct}%`, 400, currentTableY + 5);
           
        currentTableY += 20;
      });
    }

    // SECTION 4: SAVINGS FORECAST & GOALS
    const goalY = currentTableY + 30;
    doc.fillColor(primaryColor)
       .font('Helvetica')
       .fontSize(16)
       .text('4. Financial Goals & Forecasts', 50, goalY)
       .rect(50, goalY + 20, 495.28, 2).fill(accentColor);

    let currentGoalY = goalY + 35;
    if (goals.length === 0) {
      doc.font('Helvetica').fontSize(10).fillColor(textColor)
         .text('No active financial goals found. You can set saving targets in the settings page.', 60, currentGoalY);
    } else {
      goals.slice(0, 3).forEach((g) => {
        const pct = g.targetAmount > 0 ? ((g.currentSaved / g.targetAmount) * 100).toFixed(1) : '0';
        doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor)
           .text(`Goal Target: INR ${g.targetAmount.toLocaleString()}`, 60, currentGoalY)
           .font('Helvetica').fontSize(9).fillColor(textColor)
           .text(`Current Saved: INR ${g.currentSaved.toLocaleString()} (${pct}% achieved)  |  Target Date: ${new Date(g.targetDate).toLocaleDateString()}`, 60, currentGoalY + 15);
        currentGoalY += 35;
      });
    }

    // SECTION 5: AI CFO STRATEGIC RECOMMENDATIONS
    const recY = Math.max(currentGoalY + 10, 560);
    doc.fillColor(primaryColor)
       .font('Helvetica')
       .fontSize(16)
       .text('5. AI CFO Strategic Recommendations', 50, recY)
       .rect(50, recY + 20, 495.28, 2).fill(accentColor);

    doc.moveDown(1.5);
    
    // Dynamic rules-based AI Recommendations simulating Llama CFO insight
    doc.fontSize(9.5).fillColor(textColor);
    
    let recommendationBullets = [];
    if (parseFloat(savingsRate) < 20) {
      recommendationBullets.push('Low Savings Rate: Your savings rate is below the recommended 20% threshold. Analyze your discretionary category spending (like Food or Shopping) to identify cost-saving opportunities.');
    } else {
      recommendationBullets.push('Excellent Savings Rate: You are maintaining a healthy savings cushion of over 20%. Consider allocating these savings to safe yielding options (like FDs or long-term investments) to beat inflation.');
    }

    if (totalExpense > totalIncome) {
      recommendationBullets.push('Urgent Budget Overrun: Your overall expenses exceed your total income. Immediate cash-flow stabilization is needed. Cut down non-essential items.');
    }

    if (burnRate > user.monthlyIncome * 0.8) {
      recommendationBullets.push('High Current Month Burn: This month\'s expenses have consumed over 80% of your declared monthly income. Pause luxury purchases for the remainder of this cycle.');
    } else {
      recommendationBullets.push('Healthy Monthly Burn Rate: Your current month spending is well under control relative to your monthly income.');
    }

    if (goals.length === 0) {
      recommendationBullets.push('Goal Blueprint Missing: Setting clear financial targets accelerates asset accumulation. Establish a short-term emergency fund goal (3-6 months of expenses) in Settings.');
    }

    recommendationBullets.push('Investment Restriction Note: As your AI CFO, I recommend focusing on budgeting, habit optimization, and tracking. Consult a certified fiduciary advisor for direct investment and stock portfolio advice.');

    let bulletY = recY + 30;
    recommendationBullets.forEach(bullet => {
      doc.font('Helvetica-Bold').fillColor(accentColor).text('•', 55, bulletY);
      doc.font('Helvetica').fillColor(textColor).text(bullet, 70, bulletY, { width: 470, lineGap: 2 });
      // Calculate approximate heights
      const textHeight = doc.heightOfString(bullet, { width: 470 });
      bulletY += textHeight + 10;
    });

    // FOOTER (Page number & Disclaimer)
    doc.fillColor('#9CA3AF')
       .fontSize(8)
       .text('Disclaimer: FinServe AI Personal CFO reports are generated based on historical data. Financial projections are estimates and not guarantees. FinServe does not provide investment advice.', 50, 750, { align: 'center', width: 495.28 });

    // End Document
    doc.end();
  } catch (error) {
    console.error('PDF Report Generation Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating PDF report document' });
  }
});

module.exports = router;
