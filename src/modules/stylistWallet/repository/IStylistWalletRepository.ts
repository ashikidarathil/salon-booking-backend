import { IStylistWallet } from '../../../models/stylistWallet.model';
import { ClientSession } from 'mongoose';
export interface IStylistWalletRepository {
  findByStylistId(stylistId: string): Promise<IStylistWallet | null>;
  create(data: Partial<IStylistWallet>, session?: ClientSession): Promise<IStylistWallet>;
  updateBalance(
    stylistId: string,
    update: { withdrawableBalance?: number; pendingWithdrawal?: number; totalEarnings?: number },
    session?: ClientSession,
  ): Promise<IStylistWallet | null>;
}
