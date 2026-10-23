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

const PRODUCTION_CLIENT_URL =
  'https://budgetly-expense-tracker-app.vercel.app';

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  PRODUCTION_CLIENT_URL,
  ...configuredOrigins,
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']),
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    const error = new Error('Origin is not allowed by CORS.');
    error.status = 403;
    return callback(error);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'Origin',
    'X-Requested-With',
  ],
  credentials: false,
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());

// Answer browser preflight requests before they reach authentication or the
// database. This prevents OPTIONS requests from turning into 500 errors.
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) =>
  res.status(200).json({ success: true, service: 'budgetly-api' }),
);

let databaseConnection = null;

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (databaseConnection) return databaseConnection;

  if (!process.env.MONGO_URI) {
    const error = new Error('MONGO_URI is not configured.');
    error.status = 503;
    return Promise.reject(error);
  }

  databaseConnection = mongoose
    .connect(process.env.MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    })
    .catch((error) => {
      databaseConnection = null;
      throw error;
    });

  return databaseConnection;
};

// Connect lazily so health checks and CORS preflights still work if MongoDB is
// temporarily unavailable. The cached promise is reused across warm requests.
app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large.',
    });
  }

  if (err?.status === 403) {
    return res.status(403).json({
      success: false,
      message: 'Origin is not allowed by CORS.',
    });
  }

  if (
    err?.name === 'MongooseServerSelectionError' ||
    err?.name === 'MongooseError' ||
    err?.status === 503
  ) {
    console.error('Database error:', err);
    return res.status(503).json({
      success: false,
      message: 'The database is temporarily unavailable. Please try again.',
    });
  }

  console.error('Unhandled error:', err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Budgetly API is running on port ${PORT}`);

    connectDatabase()
      .then(async () => {
        console.log('MongoDB Connected Successfully!');
        await migrateBudgets();
      })
      .catch((error) => {
        console.error('DB Connection Error:', error);
      });
  });
}
