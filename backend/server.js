const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
// Also fallback to root .env if present
dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Body parser & CORS middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount REST API Routes
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'ExpenseFlow API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets (allows single-command full-stack running)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// For SPA or navigation fallback
app.get('/transactions', (req, res) => {
  res.sendFile(path.join(frontendPath, 'transactions.html'));
});

app.get('*', (req, res) => {
  // If request doesn't match API, serve index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ success: false, error: 'API route not found' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
=============================================================
   🚀 EXPENSEFLOW - FULL-STACK EXPENSE TRACKER SERVER RUNNING
=============================================================
   📡 Local URL:       http://localhost:${PORT}
   📊 Dashboard:       http://localhost:${PORT}/
   💳 Transactions:    http://localhost:${PORT}/transactions.html
   🔗 API Endpoint:    http://localhost:${PORT}/api/transactions
   🩺 API Health:      http://localhost:${PORT}/api/health
=============================================================
  `);
});

module.exports = app;
