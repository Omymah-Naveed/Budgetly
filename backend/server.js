const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budgets');
const transactionRoutes = require('./routes/transactions');
const { migrateBudgets } = require('./services/budgetService');

dotenv.config();

const app = express();

// Live frontend URL aur localhost dono ko allowed origins mein shamil kar diya hai
const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173,https://budgetly-expense-tracker-app.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security headers. The API does not serve HTML, so Helmet's defaults are safe.
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin is not allowed by CORS.');
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400,
  }),
);

// Keep request bodies small and predictable.
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) =>
  res.status(200).json({ success: true, service: 'budgetly-api' }),
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// Centralized error handler (must keep all four arguments for Express)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large.',
    });
  }

  console.error('Unhandled error:', err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first so the API never accepts requests without a database.
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully!');

    await migrateBudgets();

    app.listen(PORT, () => {
      console.log(`Budgetly API is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB Connection Error: ', err);
    process.exit(1);
  });