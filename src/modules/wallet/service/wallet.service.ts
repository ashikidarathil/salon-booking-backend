import { inject, injectable } from 'tsyringe';
import { IWalletService } from './IWalletService';
import { IWalletRepository } from '../repository/IWalletRepository';
import { IWalletTransactionRepository } from '../repository/IWalletTransactionRepository';
import { IWallet } from '../../../models/wallet.model';
import {
  IWalletTransaction,
  TransactionType,
  TransactionStatus,
} from '../../../models/walletTransaction.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { Types, ClientSession } from 'mongoose';
import { WALLET_MESSAGES } from '../constants/wallet.messages';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { TOKENS } from '../../../common/di/tokens';

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TOKENS.WalletRepository)
    private walletRepository: IWalletRepository,
    @inject(TOKENS.WalletTransactionRepository)
    private transactionRepository: IWalletTransactionRepository,
  ) {}

  async getWalletByUserId(userId: string): Promise<IWallet> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      return this.ensureWalletExists(userId);
    }
    return wallet;
  }

  async ensureWalletExists(userId: string, session?: ClientSession): Promise<IWallet> {
    let wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      wallet = await this.walletRepository.create(
        { userId: toObjectId(userId), balance: 0 },
        session,
      );
    }
    return wallet;
  }

  async creditBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: 'BOOKING' | 'ESCROW' | 'DEPOSIT' | 'WITHDRAWAL',
    session?: ClientSession,
  ): Promise<IWallet> {
    if (amount <= 0) {
      throw new AppError(WALLET_MESSAGES.INVALID_AMOUNT, HttpStatus.BAD_REQUEST);
    }

    const wallet = await this.ensureWalletExists(userId, session);

    const updatedWallet = await this.walletRepository.updateBalance(userId, amount, session);
    if (!updatedWallet) {
      throw new AppError(WALLET_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Record transaction
    await this.transactionRepository.create(
      {
        walletId: wallet._id as Types.ObjectId,
        amount,
        type: TransactionType.CREDIT,
        status: TransactionStatus.COMPLETED,
        description,
        referenceId: referenceId ? toObjectId(referenceId) : undefined,
        referenceType,
      },
      session,
    );

    return updatedWallet;
  }

  async debitBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: 'BOOKING' | 'ESCROW' | 'DEPOSIT' | 'WITHDRAWAL',
    session?: ClientSession,
  ): Promise<IWallet> {
    if (amount <= 0) {
      throw new AppError(WALLET_MESSAGES.INVALID_AMOUNT, HttpStatus.BAD_REQUEST);
    }

    const wallet = await this.getWalletByUserId(userId);
    if (wallet.balance < amount) {
      throw new AppError(WALLET_MESSAGES.INSUFFICIENT_BALANCE, HttpStatus.BAD_REQUEST);
    }

    const updatedWallet = await this.walletRepository.updateBalance(userId, -amount, session);
    if (!updatedWallet) {
      throw new AppError(WALLET_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Record transaction
    await this.transactionRepository.create(
      {
        walletId: wallet._id as Types.ObjectId,
        amount,
        type: TransactionType.DEBIT,
        status: TransactionStatus.COMPLETED,
        description,
        referenceId: referenceId ? toObjectId(referenceId) : undefined,
        referenceType,
      },
      session,
    );

    return updatedWallet;
  }

  async getTransactionHistory(userId: string): Promise<IWalletTransaction[]> {
    const wallet = await this.getWalletByUserId(userId);
    return this.transactionRepository.findByWalletId(wallet._id.toString());
  }
}
