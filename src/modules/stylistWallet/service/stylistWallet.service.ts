import { inject, injectable } from 'tsyringe';
import { IStylistWalletService } from './IStylistWalletService';
import { IStylistWalletRepository } from '../repository/IStylistWalletRepository';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { StylistWalletMapper } from '../mapper/stylistWallet.mapper';
import { StylistWalletResponseDto } from '../dto/stylistWallet.response.dto';
import { STYLIST_WALLET_MESSAGES } from '../constants/stylistWallet.messages';
import { toObjectId, isValidObjectId, ObjectId } from '../../../common/utils/mongoose.util';
import { ClientSession } from 'mongoose';

@injectable()
export class StylistWalletService implements IStylistWalletService {
  constructor(
    @inject(TOKENS.StylistWalletRepository)
    private walletRepository: IStylistWalletRepository,
  ) {}

  async getWallet(stylistId: string): Promise<StylistWalletResponseDto> {
    if (!isValidObjectId(stylistId))
      throw new AppError(STYLIST_WALLET_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    let wallet = await this.walletRepository.findByStylistId(stylistId);
    if (!wallet) {
      wallet = await this.walletRepository.create({ stylistId: toObjectId(stylistId) });
    }
    return StylistWalletMapper.toWalletDto(wallet);
  }

  async addEarnings(stylistId: string, amount: number): Promise<void> {
    if (!isValidObjectId(stylistId))
      throw new AppError(STYLIST_WALLET_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    let wallet = await this.walletRepository.findByStylistId(stylistId);
    if (!wallet) {
      wallet = await this.walletRepository.create({ stylistId: toObjectId(stylistId) });
    }
    await this.walletRepository.updateBalance(
      stylistId,
      { withdrawableBalance: amount, totalEarnings: amount },
    );
    console.log(STYLIST_WALLET_MESSAGES.LOGS.CREDITED(amount, stylistId));
  }
}
