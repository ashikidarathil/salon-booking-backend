import { BaseRepository } from '../../../common/repository/baseRepository';
import { IWallet, WalletModel } from '../../../models/wallet.model';
import { IWalletRepository } from './IWalletRepository';
import { injectable } from 'tsyringe';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { ClientSession } from 'mongoose';

@injectable()
export class WalletRepository
  extends BaseRepository<IWallet, IWallet>
  implements IWalletRepository
{
  constructor() {
    super(WalletModel);
  }

  protected toEntity(doc: IWallet): IWallet {
    return doc;
  }

  async findByUserId(userId: string): Promise<IWallet | null> {
    return this.findOne({ userId });
  }

  async updateBalance(
    userId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IWallet | null> {
    return this._model
      .findOneAndUpdate(
        { userId: toObjectId(userId) },
        { $inc: { balance: amount } },
        { new: true, session },
      )
      .exec();
  }
}
