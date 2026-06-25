const express = require('express');
const router = express.Router();
const multer = require('multer');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Category mapper based on keyword matching
const autoCategorize = (description) => {
  const desc = (description || '').toLowerCase();
  
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('youtube') || desc.includes('prime') || desc.includes('disney') || desc.includes('movie') || desc.includes('entertainment') || desc.includes('show')) {
    return 'Entertainment';
  }
  if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('food') || desc.includes('restaurant') || desc.includes('eat') || desc.includes('cafe') || desc.includes('starbucks')) {
    return 'Food';
  }
  if (desc.includes('uber') || desc.includes('ola') || desc.includes('lyft') || desc.includes('cab') || desc.includes('metro') || desc.includes('train') || desc.includes('flight') || desc.includes('travel') || desc.includes('fuel') || desc.includes('petrol')) {
    return 'Travel';
  }
  if (desc.includes('electricity') || desc.includes('power') || desc.includes('water') || desc.includes('gas') || desc.includes('rent') || desc.includes('wifi') || desc.includes('internet') || desc.includes('telecom') || desc.includes('phone') || desc.includes('mobile') || desc.includes('bill')) {
    return 'Bills';
  }
  if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('mall') || desc.includes('shop') || desc.includes('store') || desc.includes('grocer') || desc.includes('supermarket')) {
    return 'Shopping';
  }
  if (desc.includes('hospital') || desc.includes('pharmacy') || desc.includes('doctor') || desc.includes('clinic') || desc.includes('medical') || desc.includes('medicine')) {
    return 'Healthcare';
  }
  if (desc.includes('school') || desc.includes('college') || desc.includes('udemy') || desc.includes('coursera') || desc.includes('book') || desc.includes('course') || desc.includes('fees')) {
    return 'Education';
  }
  if (desc.includes('stock') || desc.includes('mutual fund') || desc.includes('crypto') || desc.includes('sip') || desc.includes('invest') || desc.includes('equity') || desc.includes('shares')) {
    return 'Investment';
  }
  
  return 'Other';
};

// Helper to parse CSV lines safely
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// @route   POST /api/upload
// @desc    Import expenses from CSV file
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const csvData = req.file.buffer.toString('utf8');
    const lines = csvData.split(/\r?\n/);
    
    if (lines.length <= 1) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or missing data rows' });
    }

    const savedExpenses = [];
    let parsedCount = 0;
    let errorCount = 0;

    // Process rows (skipping header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // skip blank lines

      const columns = parseCSVLine(line);
      
      // Expected format: Date,Description,Amount
      if (columns.length < 3) {
        errorCount++;
        continue;
      }

      const rawDate = columns[0];
      const description = columns[1];
      const rawAmount = columns[2];

      const amount = parseFloat(rawAmount.replace(/[^\d.-]/g, ''));
      if (isNaN(amount) || amount <= 0) {
        errorCount++;
        continue;
      }

      let date = new Date(rawDate);
      if (isNaN(date.getTime())) {
        date = new Date(); // fallback to current date if invalid
      }

      const category = autoCategorize(description);

      const expense = new Expense({
        userId: req.user.id,
        amount,
        category,
        description,
        date
      });

      await expense.save();
      savedExpenses.push(expense);
      parsedCount++;
    }

    res.status(201).json({
      success: true,
      message: `CSV import completed. Successfully imported ${parsedCount} expenses.`,
      details: {
        totalProcessed: parsedCount,
        failedRows: errorCount
      },
      data: savedExpenses
    });
  } catch (error) {
    console.error('CSV import error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error processing CSV file' });
  }
});

module.exports = router;
