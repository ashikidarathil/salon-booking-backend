import { IWithdrawalRequest, WithdrawalStatus } from '../../../models/withdrawalRequest.model';
import { ClientSession } from 'mongoose';
import { PopulateOptions, ObjectId } from '../../../common/utils/mongoose.util';
import { SortOptions } from '../../../common/repository/baseRepository';

export interface IWithdrawalRequestRepository {
  create(data: Partial<IWithdrawalRequest>, session?: ClientSession): Promise<IWithdrawalRequest>;
  findById(id: string): Promise<IWithdrawalRequest | null>;
  findByStylistId(stylistId: string): Promise<IWithdrawalRequest[]>;
  findAll(
    filter: Record<string, unknown>,
    sort?: SortOptions,
    populate?: PopulateOptions[],
  ): Promise<IWithdrawalRequest[]>;
  updateStatus(
    id: string,
    status: WithdrawalStatus,
    processedAt?: Date,
    rejectionReason?: string,
    paymentReferenceNumber?: string,
    paidByAdminId?: string,
    session?: ClientSession,
  ): Promise<IWithdrawalRequest | null>;
}
