require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Add it to your .env file before starting the server.');
}

const app = express();
app.set('trust proxy', 1);

const trustedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many quiz registrations from this IP, please try again later.' },
});

app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || trustedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503);
    next(error);
  }
});
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

app.use('/api', apiLimiter);
app.use('/api/admin/auth/login', authLimiter);
app.use('/api/attempts/quiz', registrationLimiter);

app.use('/api/admin/auth', require('./routes/authRoutes'));
app.use('/api/admin/quizzes', require('./routes/adminRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

app.get('/', (req, res) => {
  res.send('DRR Quiz API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((error) => {
      console.error(`MongoDB connection failed: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = app;
