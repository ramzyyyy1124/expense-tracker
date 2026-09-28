const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const Transaction = require('./models/Transaction');

const sampleTransactions = [
  {
    title: 'Monthly Salary',
    amount: 50000,
    type: 'Income',
    category: 'Other',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    description: 'Monthly salary credited for Software Developer role'
  },
  {
    title: 'Freelance Design Project',
    amount: 15000,
    type: 'Income',
    category: 'Other',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    description: 'Landing page UI/UX freelance contract'
  },
  {
    title: 'Grocery Supermarket',
    amount: 3200,
    type: 'Expense',
    category: 'Food',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    description: 'Weekly organic groceries, fruits and vegetables'
  },
  {
    title: 'Uber Cab Ride',
    amount: 450,
    type: 'Expense',
    category: 'Transport',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    description: 'Commute to city tech hub meetup'
  },
  {
    title: 'Electricity & Water Bill',
    amount: 2150,
    type: 'Expense',
    category: 'Bills',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    description: 'Monthly utility bills payment'
  },
  {
    title: 'Zara Casual Wear',
    amount: 4200,
    type: 'Expense',
    category: 'Shopping',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    description: 'Autumn jacket and shirts'
  },
  {
    title: 'Team Weekend Lunch',
    amount: 1450,
    type: 'Expense',
    category: 'Food',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'Italian bistro lunch with project team'
  },
  {
    title: 'Netflix & Spotify Subs',
    amount: 999,
    type: 'Expense',
    category: 'Entertainment',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'Monthly streaming subscriptions'
  },
  {
    title: 'Full Stack Tech Book & Course',
    amount: 1800,
    type: 'Expense',
    category: 'Education',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: 'Web development reference materials and course'
  },
  {
    title: 'Dental Checkup & Vitamins',
    amount: 1200,
    type: 'Expense',
    category: 'Healthcare',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    description: 'Annual dental cleaning and multivitamin supplements'
  }
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expenseflow';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB for seeding: ${mongoURI}`);

    // Clean existing
    await Transaction.deleteMany({});
    console.log('Cleared existing transactions.');

    // Insert sample
    const created = await Transaction.insertMany(sampleTransactions);
    console.log(`✅ Successfully seeded ${created.length} transactions!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
