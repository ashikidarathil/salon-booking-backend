import { IStylistWallet } from '../../../models/stylistWallet.model';
import { StylistWalletResponseDto } from '../dto/stylistWallet.response.dto';
import { ObjectId } from '../../../common/utils/mongoose.util';

export class StylistWalletMapper {
  static toWalletDto(wallet: IStylistWallet): StylistWalletResponseDto {
    return {
      _id: (wallet._id as ObjectId).toString(),
      stylistId: (wallet.stylistId as ObjectId).toString(),
      withdrawableBalance: wallet.withdrawableBalance,
      pendingWithdrawal: wallet.pendingWithdrawal,
      totalEarnings: wallet.totalEarnings,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
