import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IWalletController } from './IWalletController';
import { IWalletService } from '../service/IWalletService';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { WALLET_MESSAGES } from '../constants/wallet.messages';
import { WalletMapper } from '../mapper/wallet.mapper';
import { CreditWalletDto } from '../dto/wallet.dto';

interface AuthPayload {
  userId: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

@injectable()
export class WalletController implements IWalletController {
  constructor(
    @inject(TOKENS.WalletService)
    private readonly walletService: IWalletService,
  ) {}

  private extractAuth(req: Request): AuthPayload | null {
    return (req as AuthenticatedRequest).auth || null;
  }

  getMyWallet = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    if (!auth) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, 'Unauthorized'));
      return;
    }

    const wallet = await this.walletService.getWalletByUserId(auth.userId);
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(true, WALLET_MESSAGES.FETCH_SUCCESS, WalletMapper.toResponseDto(wallet)),
      );
  };

  getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    if (!auth) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, 'Unauthorized'));
      return;
    }

    const transactions = await this.walletService.getTransactionHistory(auth.userId);
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          true,
          WALLET_MESSAGES.TRANSACTIONS_FETCH_SUCCESS,
          WalletMapper.toTransactionListResponseDto(transactions),
        ),
      );
  };

  creditMyWallet = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    if (!auth) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, 'Unauthorized'));
      return;
    }

    const { amount, description }: CreditWalletDto = req.body;
    const wallet = await this.walletService.creditBalance(
      auth.userId,
      amount,
      description,
      undefined,
      'DEPOSIT',
    );
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(true, WALLET_MESSAGES.CREDIT_SUCCESS, WalletMapper.toResponseDto(wallet)),
      );
  };
}
