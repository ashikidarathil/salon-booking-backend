import { IWalletTransaction } from '../../../models/walletTransaction.model';
import { ClientSession } from 'mongoose';

export interface IWalletTransactionRepository {
  create(data: Partial<IWalletTransaction>, session?: ClientSession): Promise<IWalletTransaction>;
  find(filter: Record<string, unknown>): Promise<IWalletTransaction[]>;
  findByWalletId(walletId: string): Promise<IWalletTransaction[]>;
}
