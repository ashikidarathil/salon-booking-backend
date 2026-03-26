import { IReview } from '../../../models/review.model';
import {
  CreateReviewDto,
  ReviewPaginationDto,
  ReviewResponseDto,
  TopServiceDto,
  TopStylistDto,
} from '../dto/review.schema';

export interface IReviewService {
  createReview(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto>;
  getReviewById(id: string): Promise<IReview>;
  listReviews(query: ReviewPaginationDto): Promise<{ reviews: ReviewResponseDto[]; total: number }>;
  getStylistRating(stylistId: string): Promise<{ averageRating: number; totalReviews: number }>;
  getTopStylists(limit?: number): Promise<TopStylistDto[]>;
  getTopServices(limit?: number): Promise<TopServiceDto[]>;
  deleteReview(id: string): Promise<void>;
  restoreReview(id: string): Promise<void>;
}
