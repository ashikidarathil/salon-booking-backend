import { WishlistDocument, WishlistModel } from '../../../models/wishlist.model';
import { IWishlistRepository } from './IWishlistRepository';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { injectable } from 'tsyringe';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class WishlistRepository
  extends BaseRepository<WishlistDocument, WishlistDocument>
  implements IWishlistRepository
{
  constructor() {
    super(WishlistModel);
  }

  protected toEntity(doc: WishlistDocument): WishlistDocument {
    return doc;
  }

  async deleteOne(filter: Record<string, unknown>): Promise<boolean> {
    const result = await WishlistModel.deleteOne(filter);
    return result.deletedCount > 0;
  }

  async getFavoritesSet(userId: string, stylistIds: string[]): Promise<Set<string>> {
    const favorites = await WishlistModel.find({
      userId: toObjectId(userId),
      stylistId: { $in: stylistIds.map((id) => toObjectId(id)) },
    })
      .select('stylistId')
      .lean();

    return new Set(favorites.map((f) => f.stylistId.toString()));
  }
}
