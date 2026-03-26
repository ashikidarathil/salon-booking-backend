import cron from 'node-cron';
import { container } from 'tsyringe';
import { TOKENS } from './di/tokens';
import { IBookingQueryService } from '../modules/booking/service/IBookingQueryService';
import { IEscrowService } from '../modules/escrow/service/IEscrowService';
import { IChatService } from '../modules/chat/service/IChatService';

export const initCronJobs = () => {
  console.log('[CRON] Initializing Cron Jobs...');

  cron.schedule('*/5 * * * *', async () => {
    try {
      const bookingQueryService = container.resolve<IBookingQueryService>(
        TOKENS.BookingQueryService,
      );
      const expiredCount = await bookingQueryService.checkExpiredBookings();
      if (expiredCount > 0) {
        console.log(`[CRON] Cleaned up ${expiredCount} expired pending bookings.`);
      }
    } catch (error) {
      console.error('[CRON] Error in booking cleanup job:', error);
    }
  });

  // Escrow release — runs every 2 minutes (User requested)
  cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('[CRON] Starting daily escrow release...');
      const escrowService = container.resolve<IEscrowService>(TOKENS.EscrowService);
      await escrowService.releaseDailyEscrow();
      console.log('[CRON] Daily escrow release completed.');
    } catch (error) {
      console.error('[CRON] Error in daily escrow release job:', error);
    }
  });

  // 3. Hourly chat auto-close — closes rooms for completed/cancelled bookings older than 24h
  cron.schedule('0 * * * *', async () => {
    try {
      const chatService = container.resolve<IChatService>(TOKENS.ChatService);
      const closedCount = await chatService.closeExpiredRooms();
      if (closedCount > 0) {
        console.log(`[CRON] Auto-closed ${closedCount} expired chat room(s).`);
      }
    } catch (error) {
      console.error('[CRON] Error in chat auto-close job:', error);
    }
  });

  console.log('[CRON] Booking cleanup job scheduled (every 5 minutes)');
  console.log('[CRON] Escrow release job scheduled (every 2 minutes)');
  console.log('[CRON] Chat auto-close job scheduled (every hour)');
};
