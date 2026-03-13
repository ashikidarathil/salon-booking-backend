import { injectable } from 'tsyringe';
import { BaseRepository, SortOptions } from '../../../common/repository/baseRepository';
import {
  IWithdrawalRequest,
  WithdrawalRequestModel,
  WithdrawalStatus,
} from '../../../models/withdrawalRequest.model';
import { IWithdrawalRequestRepository } from './IWithdrawalRequestRepository';
import { ClientSession, UpdateQuery } from 'mongoose';
import { toObjectId, PopulateOptions } from '../../../common/utils/mongoose.util';

@injectable()
export class WithdrawalRequestRepository
  extends BaseRepository<IWithdrawalRequest, IWithdrawalRequest>
  implements IWithdrawalRequestRepository
{
  constructor() {
    super(WithdrawalRequestModel);
  }

  protected toEntity(doc: IWithdrawalRequest): IWithdrawalRequest {
    return doc;
  }

  async findByStylistId(stylistId: string): Promise<IWithdrawalRequest[]> {
    return this.find({ stylistId }, [], { createdAt: -1 });
  }

  async findAll(
    filter: Record<string, unknown>,
    sort?: SortOptions,
    populate?: PopulateOptions[],
  ): Promise<IWithdrawalRequest[]> {
    return this.find(filter, populate, sort);
  }

  async updateStatus(
    id: string,
    status: WithdrawalStatus,
    processedAt?: Date,
    rejectionReason?: string,
    paymentReferenceNumber?: string,
    paidByAdminId?: string,
    session?: ClientSession,
  ): Promise<IWithdrawalRequest | null> {
    const updateData: UpdateQuery<IWithdrawalRequest> = { status };
    if (processedAt) updateData.processedAt = processedAt;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (paymentReferenceNumber) updateData.paymentReferenceNumber = paymentReferenceNumber;
    if (paidByAdminId) {
      updateData.paidByAdminId = toObjectId(paidByAdminId);
      updateData.paidAt = new Date();
      if (status === WithdrawalStatus.APPROVED) updateData.approvedAt = new Date();
    }
    return this.update(id, updateData, session);
  }
}
