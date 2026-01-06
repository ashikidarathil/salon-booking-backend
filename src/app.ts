import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import authRoutes from './modules/auth/routes/auth.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import { globalErrorHandler } from './common/errors/errorHandler';
import stylistInviteRoutes from './modules/stylistInvite/routes/stylistInvite.routes';

const app = express();
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

connectDB();
connectRedis();

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', stylistInviteRoutes);
app.use(globalErrorHandler);

export default app;
