import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IWishlistRepository } from '../repository/IWishlistRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { IStylistBranchRepository } from '../../stylistBranch/repository/IStylistBranchRepository';
import { StylistBranchModel } from '../../../models/stylistBranch.model';

@injectable()
export class WishlistService {
  constructor(
    @inject(TOKENS.WishlistRepository) private readonly _wishlistRepo: IWishlistRepository,
    @inject(TOKENS.StylistBranchRepository)
    private readonly _stylistBranchRepo: IStylistBranchRepository,
  ) {}

  async toggleFavorite(userId: string, stylistId: string): Promise<boolean> {
    const filter = {
      userId: toObjectId(userId),
      stylistId: toObjectId(stylistId),
    };

    const existing = await this._wishlistRepo.findOne(filter);

    if (existing) {
      await this._wishlistRepo.deleteOne(filter);
      return false; // Removed
    } else {
      await this._wishlistRepo.create(filter);
      return true; // Added
    }
  }

  async getMyFavorites(userId: string, branchId?: string): Promise<string[]> {
    const list = await this._wishlistRepo.find({ userId: toObjectId(userId) });
    const stylistIds = list.map((doc) => doc.stylistId.toString());

    if (!branchId || stylistIds.length === 0) {
      return stylistIds;
    }

    // Filter by branch
    const branchStylists = await StylistBranchModel.find({
      branchId: toObjectId(branchId),
      stylistId: { $in: stylistIds.map((id) => toObjectId(id)) },
      isActive: true,
    })
      .select('stylistId')
      .lean();

    return branchStylists.map((bs) => bs.stylistId.toString());
  }

  async isFavorite(userId: string, stylistId: string): Promise<boolean> {
    const count = await this._wishlistRepo.count({
      userId: toObjectId(userId),
      stylistId: toObjectId(stylistId),
    });
    return count > 0;
  }

  async getFavoritesForStylists(userId: string, stylistIds: string[]): Promise<Set<string>> {
    return this._wishlistRepo.getFavoritesSet(userId, stylistIds);
  }
}
