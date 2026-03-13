import { BaseRepository } from '../../../common/repository/baseRepository';
import {
  IWalletTransaction,
  WalletTransactionModel,
} from '../../../models/walletTransaction.model';
import { IWalletTransactionRepository } from './IWalletTransactionRepository';
import { injectable } from 'tsyringe';
import { ObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class WalletTransactionRepository
  extends BaseRepository<IWalletTransaction, IWalletTransaction>
  implements IWalletTransactionRepository
{
  constructor() {
    super(WalletTransactionModel);
  }

  protected toEntity(doc: IWalletTransaction): IWalletTransaction {
    return doc;
  }

  async findByWalletId(walletId: string): Promise<IWalletTransaction[]> {
    return this.find({ walletId }, undefined, { createdAt: -1 });
  }
}
