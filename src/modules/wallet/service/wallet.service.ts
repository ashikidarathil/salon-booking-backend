import { inject, injectable } from 'tsyringe';
import { IWalletService } from './IWalletService';
import { IWalletRepository } from '../repository/IWalletRepository';
import { IWalletTransactionRepository } from '../repository/IWalletTransactionRepository';
import { IWallet } from '../../../models/wallet.model';
import {
  IWalletTransaction,
  TransactionType,
  TransactionStatus,
  TransactionReferenceType,
} from '../../../models/walletTransaction.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ClientSession } from 'mongoose';
import { WALLET_MESSAGES } from '../constants/wallet.messages';
import { toObjectId, ObjectId } from '../../../common/utils/mongoose.util';
import { TOKENS } from '../../../common/di/tokens';
import { IRazorpayService, RazorpayOrder } from '../../payment/service/IRazorpayService';
import { IPaymentRepository } from '../../payment/repository/IPaymentRepository';
import { PaymentStatus } from '../../../models/payment.model';
import { env } from '../../../config/env';

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TOKENS.WalletRepository)
    private walletRepository: IWalletRepository,
    @inject(TOKENS.WalletTransactionRepository)
    private transactionRepository: IWalletTransactionRepository,
    @inject(TOKENS.RazorpayService)
    private razorpayService: IRazorpayService,
    @inject(TOKENS.PaymentRepository)
    private paymentRepository: IPaymentRepository,
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
    referenceType?: TransactionReferenceType,
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
        walletId: wallet._id as ObjectId,
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
    referenceType?: TransactionReferenceType,
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
        walletId: wallet._id as ObjectId,
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

  async createTopupOrder(
    userId: string,
    amount: number,
  ): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
    if (amount < 100) {
      throw new AppError(WALLET_MESSAGES.MIN_TOPUP_ERROR, HttpStatus.BAD_REQUEST);
    }

    // Ensure wallet exists
    await this.ensureWalletExists(userId);

    const shortUserId = userId.slice(-8);
    const shortTs = Date.now().toString().slice(-8);
    const order = (await this.razorpayService.createOrder(
      amount,
      'INR',
      `tp_${shortUserId}_${shortTs}`,
    )) as RazorpayOrder;

    await this.paymentRepository.create({
      orderId: order.id,
      amount,
      currency: 'INR',
      status: PaymentStatus.PENDING,
      userId: toObjectId(userId),
    });

    return { orderId: order.id, amount, currency: 'INR', keyId: env.RAZORPAY_KEY_ID };
  }

  async verifyTopupAndCredit(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<IWallet> {
    const isVerified = this.razorpayService.verifySignature(orderId, paymentId, signature);
    if (!isVerified) {
      throw new AppError(WALLET_MESSAGES.INVALID_SIGNATURE, HttpStatus.BAD_REQUEST);
    }

    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new AppError(WALLET_MESSAGES.PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Mark payment as completed
    await this.paymentRepository.update(payment._id.toString(), {
      status: PaymentStatus.COMPLETED,
      paymentId,
      signature,
    });

    // Credit the wallet
    return this.creditBalance(
      userId,
      payment.amount,
      'Wallet top-up via Razorpay',
      payment._id.toString(),
      'DEPOSIT',
    );
  }
}
