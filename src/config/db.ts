import mongoose from 'mongoose';
import { env } from './env';
import { logInfo, logError } from '../logger/log.util';
export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logInfo('MongoDB connected successfully');
  } catch (error) {
    logError('MongoDB connection failed:');
    // console.error is synchronous, so the reason is visible before the process exits
    console.error('MongoDB connection failed:', (error as Error).message);
    process.exit(1);
  }
};
