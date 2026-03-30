"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("./di/tokens");
const initCronJobs = () => {
    console.log('[CRON] Initializing Cron Jobs...');
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        try {
            const bookingQueryService = tsyringe_1.container.resolve(tokens_1.TOKENS.BookingQueryService);
            const expiredCount = await bookingQueryService.checkExpiredBookings();
            if (expiredCount > 0) {
                console.log(`[CRON] Cleaned up ${expiredCount} expired pending bookings.`);
            }
        }
        catch (error) {
            console.error('[CRON] Error in booking cleanup job:', error);
        }
    });
    // Escrow release — runs every 2 minutes (User requested)
    node_cron_1.default.schedule('*/2 * * * *', async () => {
        try {
            console.log('[CRON] Starting daily escrow release...');
            const escrowService = tsyringe_1.container.resolve(tokens_1.TOKENS.EscrowService);
            await escrowService.releaseDailyEscrow();
            console.log('[CRON] Daily escrow release completed.');
        }
        catch (error) {
            console.error('[CRON] Error in daily escrow release job:', error);
        }
    });
    // 3. Hourly chat auto-close — closes rooms for completed/cancelled bookings older than 24h
    node_cron_1.default.schedule('0 * * * *', async () => {
        try {
            const chatService = tsyringe_1.container.resolve(tokens_1.TOKENS.ChatService);
            const closedCount = await chatService.closeExpiredRooms();
            if (closedCount > 0) {
                console.log(`[CRON] Auto-closed ${closedCount} expired chat room(s).`);
            }
        }
        catch (error) {
            console.error('[CRON] Error in chat auto-close job:', error);
        }
    });
    console.log('[CRON] Booking cleanup job scheduled (every 5 minutes)');
    console.log('[CRON] Escrow release job scheduled (every 2 minutes)');
    console.log('[CRON] Chat auto-close job scheduled (every hour)');
};
exports.initCronJobs = initCronJobs;
