import { IWallet } from '../../../models/wallet.model';
import { ClientSession } from 'mongoose';

export interface IWalletRepository {
  findById(id: string): Promise<IWallet | null>;
  findByUserId(userId: string): Promise<IWallet | null>;
  create(data: Partial<IWallet>, session?: ClientSession): Promise<IWallet>;
  updateBalance(userId: string, amount: number, session?: ClientSession): Promise<IWallet | null>;
}
