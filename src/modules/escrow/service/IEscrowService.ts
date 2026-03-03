import { IEscrow } from '../../../models/escrow.model';
import { ClientSession } from 'mongoose';

export interface IEscrowService {
  holdAmount(
    bookingId: string,
    userId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IEscrow>;
  releaseAmount(bookingId: string, session?: ClientSession): Promise<void>;
  refundAmount(bookingId: string, session?: ClientSession): Promise<void>;
  getEscrowByBookingId(bookingId: string): Promise<IEscrow | null>;
}
