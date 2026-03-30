"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./common/container");
require("./modules/registry");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/routes/admin.routes"));
const stylistInvite_routes_1 = __importDefault(require("./modules/stylistInvite/routes/stylistInvite.routes"));
const category_routes_1 = __importDefault(require("./modules/category/routes/category.routes"));
const service_routes_1 = __importDefault(require("./modules/service/routes/service.routes"));
const branch_routes_1 = __importDefault(require("./modules/branch/routes/branch.routes"));
const stylistBranch_routes_1 = __importDefault(require("./modules/stylistBranch/routes/stylistBranch.routes"));
const branchCategory_routes_1 = __importDefault(require("./modules/branchCategory/routes/branchCategory.routes"));
const branchService_routes_1 = __importDefault(require("./modules/branchService/routes/branchService.routes"));
const slot_routes_1 = __importDefault(require("./modules/slot/routes/slot.routes"));
const booking_routes_1 = __importDefault(require("./modules/booking/routes/booking.routes"));
const schedule_routes_1 = __importDefault(require("./modules/schedule/routes/schedule.routes"));
const offDay_routes_1 = __importDefault(require("./modules/offDay/routes/offDay.routes"));
const holiday_routes_1 = __importDefault(require("./modules/holiday/routes/holiday.routes"));
const stylistService_routes_1 = __importDefault(require("./modules/stylistService/routes/stylistService.routes"));
const wishlist_routes_1 = __importDefault(require("./modules/wishlist/routes/wishlist.routes"));
const wallet_routes_1 = __importDefault(require("./modules/wallet/routes/wallet.routes"));
const escrow_routes_1 = __importDefault(require("./modules/escrow/routes/escrow.routes"));
const stylistWallet_routes_1 = __importDefault(require("./modules/stylistWallet/routes/stylistWallet.routes"));
const coupon_routes_1 = __importDefault(require("./modules/coupon/routes/coupon.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/routes/payment.routes"));
const chat_routes_1 = __importDefault(require("./modules/chat/routes/chat.routes"));
const notification_routes_1 = __importDefault(require("./modules/notification/routes/notification.routes"));
const review_routes_1 = __importDefault(require("./modules/review/routes/review.routes"));
const errorHandler_1 = require("./common/errors/errorHandler");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const block_middleware_1 = require("./common/middleware/block.middleware");
const auth_middleware_1 = require("./common/middleware/auth.middleware");
const cron_1 = require("./common/cron");
const app = (0, express_1.default)();
(0, db_1.connectDB)();
(0, redis_1.connectRedis)();
(0, cron_1.initCronJobs)();
// app.use(
//   cors({
//     origin: env.FRONTEND_ORIGIN,
//     credentials: true,
//   }),
// );
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = env_1.env.FRONTEND_ORIGIN.split(',');
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
app.use(logger_middleware_1.loggerMiddleware);
app.use('/api/auth', auth_routes_1.default);
app.use('/api', stylistInvite_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api', category_routes_1.default);
app.use('/api', service_routes_1.default);
app.use('/api', branch_routes_1.default);
app.use('/api', branchService_routes_1.default);
app.use('/api', stylistBranch_routes_1.default);
app.use('/api', branchCategory_routes_1.default);
app.use('/api', slot_routes_1.default);
app.use('/api', booking_routes_1.default);
app.use('/api/schedules', schedule_routes_1.default);
app.use('/api', offDay_routes_1.default);
app.use('/api', stylistService_routes_1.default);
app.use('/api', wishlist_routes_1.default);
app.use('/api', holiday_routes_1.default);
app.use('/api/wallet', wallet_routes_1.default);
app.use('/api/escrow', escrow_routes_1.default);
app.use('/api/stylist-wallet', stylistWallet_routes_1.default);
app.use('/api/coupons', coupon_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api', chat_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api', auth_middleware_1.authMiddleware, block_middleware_1.blockMiddleware);
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
