import { WishlistDocument } from '../../../models/wishlist.model';
import { WishlistResponseDto } from '../dto/wishlist.dto';

export class WishlistMapper {
  static toResponse(doc: WishlistDocument): WishlistResponseDto {
    return {
      id: String(doc._id),
      userId: doc.userId.toString(),
      stylistId: doc.stylistId.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
