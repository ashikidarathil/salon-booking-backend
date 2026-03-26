import { IReview } from '../../../models/review.model';
import {
  CreateReviewDto,
  ReviewPaginationDto,
  TopServiceDto,
  TopStylistDto,
} from '../dto/review.schema';
import { IBaseRepository } from '../../../common/repository/baseRepository';

export interface IReviewRepository extends IBaseRepository<IReview, IReview> {
  createReview(
    dto: CreateReviewDto & { userId: string; stylistId: string; serviceId: string },
  ): Promise<IReview>;
  findByBookingId(bookingId: string): Promise<IReview | null>;
  listReviews(query: ReviewPaginationDto): Promise<{ reviews: IReview[]; total: number }>;
  getStylistRating(stylistId: string): Promise<{ averageRating: number; totalReviews: number }>;
  getServiceRating(serviceId: string): Promise<{ averageRating: number; totalReviews: number }>;
  getTopStylists(limit: number): Promise<TopStylistDto[]>;
  getTopServices(limit: number): Promise<TopServiceDto[]>;
  softDeleteReview(id: string): Promise<void>;
  restoreReview(id: string): Promise<void>;
}
