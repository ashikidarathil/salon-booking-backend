import { IStylistWallet } from '../../../models/stylistWallet.model';
import { StylistWalletResponseDto } from '../dto/stylistWallet.response.dto';
import { ObjectId } from '../../../common/utils/mongoose.util';

export class StylistWalletMapper {
  static toWalletDto(wallet: IStylistWallet): StylistWalletResponseDto {
    return {
      id: (wallet._id as ObjectId).toString(),
      stylistId: (wallet.stylistId as ObjectId).toString(),
      balance: wallet.withdrawableBalance,
      totalEarnings: wallet.totalEarnings,
    };
  }
}
