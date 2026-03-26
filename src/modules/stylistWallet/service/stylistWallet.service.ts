import { inject, injectable } from 'tsyringe';
import { IStylistWalletService } from './IStylistWalletService';
import { IStylistWalletRepository } from '../repository/IStylistWalletRepository';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { StylistWalletMapper } from '../mapper/stylistWallet.mapper';
import { StylistWalletResponseDto } from '../dto/stylistWallet.response.dto';
import { STYLIST_WALLET_MESSAGES } from '../constants/stylistWallet.messages';
import { toObjectId, isValidObjectId, getIdString } from '../../../common/utils/mongoose.util';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';

@injectable()
export class StylistWalletService implements IStylistWalletService {
  constructor(
    @inject(TOKENS.StylistWalletRepository)
    private walletRepository: IStylistWalletRepository,
    @inject(TOKENS.StylistRepository)
    private stylistRepository: IStylistRepository,
  ) {}

  private async resolveUserId(id: string): Promise<string> {
    const stylist = await this.stylistRepository.getById(id);
    if (stylist) {
      return getIdString(stylist.userId);
    }
    return id;
  }

  async getWallet(id: string): Promise<StylistWalletResponseDto> {
    if (!isValidObjectId(id)) {
      throw new AppError(STYLIST_WALLET_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const userId = await this.resolveUserId(id);
    let wallet = await this.walletRepository.findByStylistId(userId);
    if (!wallet) {
      wallet = await this.walletRepository.create({ stylistId: toObjectId(userId) });
    }
    return StylistWalletMapper.toWalletDto(wallet);
  }

  async addEarnings(id: string, amount: number): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new AppError(STYLIST_WALLET_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const userId = await this.resolveUserId(id);
    let wallet = await this.walletRepository.findByStylistId(userId);
    if (!wallet) {
      wallet = await this.walletRepository.create({ stylistId: toObjectId(userId) });
    }
    await this.walletRepository.updateBalance(userId, {
      withdrawableBalance: amount,
      totalEarnings: amount,
    });
  }
}
