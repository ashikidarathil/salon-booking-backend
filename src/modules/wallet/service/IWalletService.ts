import { IWallet } from '../../../models/wallet.model';
import { IWalletTransaction, TransactionReferenceType } from '../../../models/walletTransaction.model';
import { ClientSession } from 'mongoose';

export interface IWalletService {
  getWalletByUserId(userId: string): Promise<IWallet>;
  creditBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: TransactionReferenceType,
    session?: ClientSession,
  ): Promise<IWallet>;
  debitBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: TransactionReferenceType,
    session?: ClientSession,
  ): Promise<IWallet>;
  getTransactionHistory(userId: string): Promise<IWalletTransaction[]>;
  ensureWalletExists(userId: string, session?: ClientSession): Promise<IWallet>;
  createTopupOrder(
    userId: string,
    amount: number,
  ): Promise<{ orderId: string; amount: number; currency: string; keyId: string }>;
  verifyTopupAndCredit(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<IWallet>;
}
