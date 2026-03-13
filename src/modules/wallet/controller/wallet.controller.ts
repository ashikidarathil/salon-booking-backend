import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IWalletController } from './IWalletController';
import { IWalletService } from '../service/IWalletService';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { WALLET_MESSAGES } from '../constants/wallet.messages';
import { WalletMapper } from '../mapper/wallet.mapper';
import { CreditWalletDto, CreateTopupOrderDto, VerifyTopupDto } from '../dto/wallet.request.dto';
import { AuthPayload } from '../../../common/types/authPayload';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

@injectable()
export class WalletController implements IWalletController {
  constructor(
    @inject(TOKENS.WalletService)
    private readonly walletService: IWalletService,
  ) {}


  getMyWallet = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth!.userId;
    const wallet = await this.walletService.getWalletByUserId(userId);
    res.status(HttpStatus.OK).json(
      ApiResponse.success(WALLET_MESSAGES.FETCH_SUCCESS, WalletMapper.toResponseDto(wallet))
    );
  };

  getTransactionHistory = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth!.userId;
    const transactions = await this.walletService.getTransactionHistory(userId);
    res.status(HttpStatus.OK).json(
      ApiResponse.success(
        WALLET_MESSAGES.TRANSACTIONS_FETCH_SUCCESS,
        WalletMapper.toTransactionListResponseDto(transactions)
      )
    );
  };

  creditMyWallet = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth!.userId;
    const { amount, description }: CreditWalletDto = req.body;
    
    if (amount <= 0) {
      throw new AppError(WALLET_MESSAGES.INVALID_AMOUNT, HttpStatus.BAD_REQUEST);
    }

    const wallet = await this.walletService.creditBalance(
      userId,
      amount,
      description,
      undefined,
      'DEPOSIT',
    );
    res.status(HttpStatus.OK).json(
      ApiResponse.success(WALLET_MESSAGES.CREDIT_SUCCESS, WalletMapper.toResponseDto(wallet))
    );
  };

  createTopupOrder = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth!.userId;
    const { amount }: CreateTopupOrderDto = req.body;
    if (!amount || amount <= 0) {
      throw new AppError(WALLET_MESSAGES.INVALID_AMOUNT, HttpStatus.BAD_REQUEST);
    }
    const order = await this.walletService.createTopupOrder(userId, amount);
    res.status(HttpStatus.CREATED).json(
      ApiResponse.success(WALLET_MESSAGES.TOPUP_ORDER_SUCCESS, order)
    );
  };

  verifyTopup = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth!.userId;
    const { orderId, paymentId, signature }: VerifyTopupDto = req.body;
    
    const wallet = await this.walletService.verifyTopupAndCredit(
      userId,
      orderId,
      paymentId,
      signature,
    );
    res.status(HttpStatus.OK).json(
      ApiResponse.success(WALLET_MESSAGES.CREDIT_SUCCESS, WalletMapper.toResponseDto(wallet))
    );
  };
}
