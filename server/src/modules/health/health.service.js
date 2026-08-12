import mongoose from 'mongoose';
import connectDB from '../../config/db.js';

export const checkHealth = async () => {
  let dbConnected = false;
  try {
    await connectDB();

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbConnected = true;
    }
  } catch (error) {
    dbConnected = false;
  }

  return {
    uptime: process.uptime(),
    dbConnected,
    timestamp: new Date().toISOString(),
  };
};
