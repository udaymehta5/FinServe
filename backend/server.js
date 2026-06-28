require('dotenv').config();

// Startup Check: Verify all required environment variables are present
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'GROQ_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('\n==================================================');
  console.error('ERROR:');
  missingVars.forEach(v => {
    console.error(`  ${v} is missing.`);
  });
  console.error('\nPlease add the missing variables to backend/.env');
  console.error('==================================================\n');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = async () => {
  try {
    const mongoose = require('mongoose');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const app = express();

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allow PDF downloads and media assets
}));

// Enable CORS
// Enable CORS
app.use(cors({
  origin: ['https://finserve-fin.vercel.app', 'https://finserve-wine.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again later' }
});
app.use('/api/', limiter);

// Connect database
connectDB();

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/income', require('./routes/income'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/report', require('./routes/report'));
app.use('/api/predict-budget', require('./routes/predict'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/upload', require('./routes/upload'));

// Centralized Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'Server error occurred'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`FinServe backend running in production mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Logged Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
