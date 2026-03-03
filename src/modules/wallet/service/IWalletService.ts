import { IWallet } from '../../../models/wallet.model';
import { IWalletTransaction } from '../../../models/walletTransaction.model';
import { ClientSession } from 'mongoose';

export interface IWalletService {
  getWalletByUserId(userId: string): Promise<IWallet>;
  creditBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: 'BOOKING' | 'ESCROW' | 'DEPOSIT' | 'WITHDRAWAL',
    session?: ClientSession,
  ): Promise<IWallet>;
  debitBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: 'BOOKING' | 'ESCROW' | 'DEPOSIT' | 'WITHDRAWAL',
    session?: ClientSession,
  ): Promise<IWallet>;
  getTransactionHistory(userId: string): Promise<IWalletTransaction[]>;
  ensureWalletExists(userId: string, session?: ClientSession): Promise<IWallet>;
}
