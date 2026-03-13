import { IStylistWallet } from '../../../models/stylistWallet.model';
import { IWithdrawalRequest, WithdrawalStatus } from '../../../models/withdrawalRequest.model';
import { ClientSession } from 'mongoose';
import { PopulateOptions, ObjectId } from '../../../common/utils/mongoose.util';
import { SortOptions } from '../../../common/repository/baseRepository';

export interface IStylistWalletRepository {
  findByStylistId(stylistId: string): Promise<IStylistWallet | null>;
  create(data: Partial<IStylistWallet>, session?: ClientSession): Promise<IStylistWallet>;
  updateBalance(
    stylistId: string,
    update: { withdrawableBalance?: number; pendingWithdrawal?: number; totalEarnings?: number },
    session?: ClientSession,
  ): Promise<IStylistWallet | null>;
}
