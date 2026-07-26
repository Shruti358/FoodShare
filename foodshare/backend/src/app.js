require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// --- Global middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger (also streams to CloudWatch via logger.js)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FoodShare API is running', timestamp: new Date().toISOString() });
});

// --- Routes (MVC: routes -> controllers -> models) ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 + error handling ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
