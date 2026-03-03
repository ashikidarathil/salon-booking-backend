import { inject, injectable } from 'tsyringe';
import { IEscrowService } from './IEscrowService';
import { IEscrowRepository } from '../repository/IEscrowRepository';
import { IEscrow } from '../../../models/escrow.model';
import { EscrowStatus, ESCROW_MESSAGES } from '../constants/escrow.constants';
import { ClientSession } from 'mongoose';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { TOKENS } from '../../../common/di/tokens';

@injectable()
export class EscrowService implements IEscrowService {
  constructor(
    @inject(TOKENS.EscrowRepository)
    private escrowRepository: IEscrowRepository,
  ) {}

  async holdAmount(
    bookingId: string,
    userId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IEscrow> {
    return this.escrowRepository.create(
      {
        bookingId: toObjectId(bookingId),
        userId: toObjectId(userId),
        amount,
        status: EscrowStatus.HELD,
        heldAt: new Date(),
      },
      session,
    );
  }

  async releaseAmount(bookingId: string, session?: ClientSession): Promise<void> {
    const escrow = await this.escrowRepository.findByBookingId(bookingId);
    if (!escrow) {
      throw new Error(ESCROW_MESSAGES.ERROR.NOT_FOUND);
    }

    if (escrow.status !== EscrowStatus.HELD) {
      throw new Error(ESCROW_MESSAGES.ERROR.INVALID_STATUS);
    }

    await this.escrowRepository.updateStatus(escrow._id.toString(), EscrowStatus.RELEASED, session);
  }

  async refundAmount(bookingId: string, session?: ClientSession): Promise<void> {
    const escrow = await this.escrowRepository.findByBookingId(bookingId);
    if (!escrow) {
      throw new Error(ESCROW_MESSAGES.ERROR.NOT_FOUND);
    }

    if (escrow.status !== EscrowStatus.HELD) {
      throw new Error(ESCROW_MESSAGES.ERROR.INVALID_STATUS);
    }

    await this.escrowRepository.updateStatus(escrow._id.toString(), EscrowStatus.REFUNDED, session);
  }

  async getEscrowByBookingId(bookingId: string): Promise<IEscrow | null> {
    return this.escrowRepository.findByBookingId(bookingId);
  }
}
