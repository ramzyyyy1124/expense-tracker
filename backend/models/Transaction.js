const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: {
        values: ['Income', 'Expense'],
        message: 'Type must be either Income or Expense'
      }
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Food',
          'Transport',
          'Shopping',
          'Entertainment',
          'Bills',
          'Education',
          'Healthcare',
          'Other'
        ],
        message: '{VALUE} is not a supported category'
      }
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtual for formatted amount or JSON formatting if needed
transactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
