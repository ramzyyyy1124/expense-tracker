const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expenseflow';
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`
👉 Tip for MongoDB Setup:
   1. For MongoDB Atlas: Update MONGO_URI in backend/.env with your Atlas cluster string.
   2. For Local MongoDB: Ensure mongod service is running.
    `);
    // Note: We don't exit process immediately so server can display helpful health status to developer
    return false;
  }
};

module.exports = connectDB;
