import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { IStylistWallet, StylistWalletModel } from '../../../models/stylistWallet.model';
import { IStylistWalletRepository } from './IStylistWalletRepository';
import { ClientSession, UpdateQuery } from 'mongoose';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class StylistWalletRepository
  extends BaseRepository<IStylistWallet, IStylistWallet>
  implements IStylistWalletRepository
{
  constructor() {
    super(StylistWalletModel);
  }

  protected toEntity(doc: IStylistWallet): IStylistWallet {
    return doc;
  }

  async findByStylistId(stylistId: string): Promise<IStylistWallet | null> {
    return this.findOne({ stylistId });
  }

  async updateBalance(
    stylistId: string,
    update: { withdrawableBalance?: number; pendingWithdrawal?: number; totalEarnings?: number },
    session?: ClientSession,
  ): Promise<IStylistWallet | null> {
    const mongoUpdate: UpdateQuery<IStylistWallet> = {};
    if (update.withdrawableBalance !== undefined) {
      mongoUpdate.$inc = { ...mongoUpdate.$inc, withdrawableBalance: update.withdrawableBalance };
    }
    if (update.pendingWithdrawal !== undefined) {
      mongoUpdate.$inc = { ...mongoUpdate.$inc, pendingWithdrawal: update.pendingWithdrawal };
    }
    if (update.totalEarnings !== undefined) {
      mongoUpdate.$inc = { ...mongoUpdate.$inc, totalEarnings: update.totalEarnings };
    }

    return this._model
      .findOneAndUpdate({ stylistId: toObjectId(stylistId) }, mongoUpdate, { new: true, session })
      .exec();
  }
}
