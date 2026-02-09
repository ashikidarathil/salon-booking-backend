import 'reflect-metadata';
import './common/container';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import authRoutes from './modules/auth/routes/auth.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import stylistInviteRoutes from './modules/stylistInvite/routes/stylistInvite.routes';
import categoryRoutes from './modules/category/routes/category.routes';
import serviceRoutes from './modules/service/routes/service.routes';
import branchRoutes from './modules/branch/routes/branch.routes';
import stylistBranchRoutes from './modules/stylistBranch/routes/stylistBranch.routes';
import branchCategoryRoutes from './modules/branchCategory/routes/branchCategory.routes';
import branchServiceRoutes from './modules/branchService/routes/branchService.routes';

import { globalErrorHandler } from './common/errors/errorHandler';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { blockMiddleware } from './common/middleware/block.middleware';
import { authMiddleware } from './common/middleware/auth.middleware';

const app = express();
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Path:', req.path);
  console.log('Content-Type header:', req.headers['content-type']);
  console.log('Body parser working?', req.body !== undefined);
  console.log('Body:', req.body);
  console.log('=== END DEBUG ===');
  next();
});

app.use(loggerMiddleware);

connectDB();
connectRedis();

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api', stylistInviteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', serviceRoutes);
app.use('/api', branchRoutes);
app.use('/api', branchServiceRoutes); 
app.use('/api', authMiddleware, blockMiddleware);
app.use('/api', stylistBranchRoutes);
app.use('/api', branchCategoryRoutes);

app.use(globalErrorHandler);

export default app;
