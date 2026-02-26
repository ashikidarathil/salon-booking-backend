import { WishlistDocument } from '../../../models/wishlist.model';
import { PopulateOptions } from 'mongoose';

export interface IWishlistRepository {
  findById(id: string, populate?: PopulateOptions[]): Promise<WishlistDocument | null>;
  find(filter: Record<string, unknown>, populate?: PopulateOptions[]): Promise<WishlistDocument[]>;
  findOne(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
  ): Promise<WishlistDocument | null>;
  create(data: Partial<WishlistDocument>): Promise<WishlistDocument>;
  delete(id: string): Promise<boolean>;
  deleteOne(filter: Record<string, unknown>): Promise<boolean>;
  count(filter: Record<string, unknown>): Promise<number>;
  getFavoritesSet(userId: string, stylistIds: string[]): Promise<Set<string>>;
}
