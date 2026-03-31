import 'reflect-metadata';
import './common/container';
import './modules/registry';
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
import slotRoutes from './modules/slot/routes/slot.routes';
import bookingRoutes from './modules/booking/routes/booking.routes';
import scheduleRoutes from './modules/schedule/routes/schedule.routes';
import offDayRoutes from './modules/offDay/routes/offDay.routes';
import holidayRoutes from './modules/holiday/routes/holiday.routes';
import stylistServiceRoutes from './modules/stylistService/routes/stylistService.routes';
import wishlistRoutes from './modules/wishlist/routes/wishlist.routes';
import walletRoutes from './modules/wallet/routes/wallet.routes';
import escrowRoutes from './modules/escrow/routes/escrow.routes';
import stylistWalletRoutes from './modules/stylistWallet/routes/stylistWallet.routes';
import couponRoutes from './modules/coupon/routes/coupon.routes';
import paymentRoutes from './modules/payment/routes/payment.routes';
import chatRoutes from './modules/chat/routes/chat.routes';
import notificationRoutes from './modules/notification/routes/notification.routes';
import reviewRoutes from './modules/review/routes/review.routes';

import { globalErrorHandler } from './common/errors/errorHandler';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { blockMiddleware } from './common/middleware/block.middleware';
import { authMiddleware } from './common/middleware/auth.middleware';

import { initCronJobs } from './common/cron';

const app = express();

connectDB();
connectRedis();
initCronJobs();

// app.use(
//   cors({
//     origin: env.FRONTEND_ORIGIN,
//     credentials: true,
//   }),
// );

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = env.FRONTEND_ORIGIN.split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Security Headers for Google Login & Auth compatibility
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

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

app.use('/api/auth', authRoutes);
app.use('/api', stylistInviteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', serviceRoutes);
app.use('/api', branchRoutes);
app.use('/api', branchServiceRoutes);
app.use('/api', stylistBranchRoutes);
app.use('/api', branchCategoryRoutes);
app.use('/api', slotRoutes);
app.use('/api', bookingRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api', offDayRoutes);
app.use('/api', stylistServiceRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', holidayRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/stylist-wallet', stylistWalletRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', authMiddleware, blockMiddleware);

app.use(globalErrorHandler);

export default app;
