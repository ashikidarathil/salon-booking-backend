import mongoose from 'mongoose';
import { env } from './env';
import { logInfo, logError } from '../logger/log.util';
export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logInfo('MongoDB connected successfully');
  } catch {
    logError('MongoDB connection failed:');
    process.exit(1);
  }
};
