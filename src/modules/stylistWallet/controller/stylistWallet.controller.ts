import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IStylistWalletController } from './IStylistWalletController';
import { IStylistWalletService } from '../service/IStylistWalletService';
import { TOKENS } from '../../../common/di/tokens';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ApiResponse } from '../../../common/response/apiResponse';
import { AuthPayload } from '../../../common/types/authPayload';
import { STYLIST_WALLET_MESSAGES } from '../constants/stylistWallet.messages';
import { AppError } from '../../../common/errors/appError';

@injectable()
export class StylistWalletController implements IStylistWalletController {
  constructor(
    @inject(TOKENS.StylistWalletService)
    private walletService: IStylistWalletService,
  ) {}

  async getStylistWallet(req: Request & { auth?: AuthPayload }, res: Response): Promise<Response> {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(STYLIST_WALLET_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const wallet = await this.walletService.getWallet(userId);
    return ApiResponse.success(res, wallet, STYLIST_WALLET_MESSAGES.WALLET_RETRIEVED);
  }

  async getWalletByStylistId(req: Request, res: Response): Promise<Response> {
    const { stylistId } = req.params;
    const wallet = await this.walletService.getWallet(stylistId);
    return ApiResponse.success(res, wallet, STYLIST_WALLET_MESSAGES.WALLET_RETRIEVED);
  }
}
