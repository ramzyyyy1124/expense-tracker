const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummaryStats
} = require('../controllers/transactionController');

// Summary statistics endpoint (placed before :id route so it doesn't get treated as an ID)
router.get('/summary/stats', getSummaryStats);

// Main collection routes: GET all, POST new
router.route('/')
  .get(getTransactions)
  .post(createTransaction);

// Single item routes: GET by ID, PUT update, DELETE remove
router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
