import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

import authRoutes from './modules/auth/routes/auth.routes';
import protectedRoutes from './modules/auth/routes/protected.routes';
import { globalErrorHandler } from './common/errors/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
connectRedis();

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use(globalErrorHandler);

export default app;
