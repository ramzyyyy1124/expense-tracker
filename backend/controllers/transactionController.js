const Transaction = require('../models/Transaction');

// @desc    Get all transactions (with optional search & filters)
// @route   GET /api/transactions
// @access  Public
const getTransactions = async (req, res) => {
  try {
    const { search, type, category, startDate, endDate, sortBy, limit } = req.query;

    let query = {};

    // Filter by Type (Income or Expense)
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by Title or Category or Description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by Date Range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting: default newest date first
    let sortOption = { date: -1, createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOption = { date: 1, createdAt: 1 };
    } else if (sortBy === 'amount-high') {
      sortOption = { amount: -1 };
    } else if (sortBy === 'amount-low') {
      sortOption = { amount: 1 };
    }

    let queryExec = Transaction.find(query).sort(sortOption);

    if (limit && !isNaN(parseInt(limit))) {
      queryExec = queryExec.limit(parseInt(limit));
    }

    const transactions = await queryExec;

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: Unable to retrieve transactions'
    });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Public
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Transaction ID'
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Basic Validation
    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, amount, type, and category'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number greater than 0'
      });
    }

    const newTransaction = await Transaction.create({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction added successfully!',
      data: newTransaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create transaction'
    });
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
// @access  Public
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a positive number greater than 0'
        });
      }
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        title: title !== undefined ? title.trim() : transaction.title,
        amount: amount !== undefined ? parseFloat(amount) : transaction.amount,
        type: type !== undefined ? type : transaction.type,
        category: category !== undefined ? category : transaction.category,
        date: date !== undefined ? new Date(date) : transaction.date,
        description: description !== undefined ? description.trim() : transaction.description
      },
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully!',
      data: transaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update transaction'
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully!',
      data: {}
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Server Error: Unable to delete transaction'
    });
  }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/transactions/summary/stats
// @access  Public
const getSummaryStats = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenses = {};

    transactions.forEach((tx) => {
      if (tx.type === 'Income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'Expense') {
        totalExpense += tx.amount;
        categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        totalBalance: balance,
        totalIncome,
        totalExpense,
        transactionCount: transactions.length,
        categoryExpenses
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error: Unable to compute summary statistics'
    });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummaryStats
};
