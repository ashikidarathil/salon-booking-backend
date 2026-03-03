import { BaseRepository } from '../../../common/repository/baseRepository';
import { IEscrow, EscrowModel, IEscrowDocument, EscrowStatus } from '../../../models/escrow.model';
import { IEscrowRepository } from './IEscrowRepository';
import { injectable } from 'tsyringe';
import { ClientSession } from 'mongoose';
import { toObjectId } from '../../../common/utils/mongoose.util';
@injectable()
export class EscrowRepository
  extends BaseRepository<IEscrowDocument, IEscrow>
  implements IEscrowRepository
{
  constructor() {
    super(EscrowModel);
  }

  protected toEntity(doc: IEscrowDocument): IEscrow {
    return doc;
  }

  async findByBookingId(bookingId: string): Promise<IEscrow | null> {
    return this.findOne({ bookingId: toObjectId(bookingId) });
  }

  async updateStatus(
    id: string,
    status: EscrowStatus,
    session?: ClientSession,
  ): Promise<IEscrow | null> {
    const updateData: Partial<IEscrow> = { status };
    if (status === EscrowStatus.RELEASED) updateData.releasedAt = new Date();
    if (status === EscrowStatus.REFUNDED) updateData.refundedAt = new Date();

    return this.update(id, updateData, session);
  }
}
