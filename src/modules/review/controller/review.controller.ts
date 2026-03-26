import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IReviewService } from '../service/IReviewService';
import { AppError } from '../../../common/errors/appError';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import {
  CreateReviewSchema,
  ReviewPaginationSchema,
  ReviewPaginationDto,
} from '../dto/review.schema';
import { REVIEW_MESSAGES } from '../constants/review.messages';

@injectable()
export class ReviewController {
  constructor(@inject(TOKENS.ReviewService) private readonly _reviewService: IReviewService) {}

  async createReview(req: Request & { auth?: { userId: string } }, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(REVIEW_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const dto = CreateReviewSchema.parse(req.body);
    const review = await this._reviewService.createReview(userId, dto);

    return ApiResponse.success(res, review, REVIEW_MESSAGES.CREATED, HttpStatus.CREATED);
  }

  async listReviews(req: Request, res: Response) {
    const query = ReviewPaginationSchema.parse(req.query) as ReviewPaginationDto;
    const data = await this._reviewService.listReviews(query);

    return ApiResponse.success(res, data, REVIEW_MESSAGES.FETCHED);
  }

  async getStylistRating(req: Request, res: Response) {
    const { stylistId } = req.params;
    const data = await this._reviewService.getStylistRating(stylistId);

    return ApiResponse.success(res, data, REVIEW_MESSAGES.STYLIST_RATING_FETCHED);
  }

  async getTopStylists(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const data = await this._reviewService.getTopStylists(limit);

    return ApiResponse.success(res, data, REVIEW_MESSAGES.FETCHED);
  }

  async getTopServices(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const data = await this._reviewService.getTopServices(limit);

    return ApiResponse.success(res, data, REVIEW_MESSAGES.FETCHED);
  }

  async deleteReview(req: Request, res: Response) {
    const { id } = req.params;
    await this._reviewService.deleteReview(id);

    return ApiResponse.success(res, null, REVIEW_MESSAGES.DELETED);
  }

  async restoreReview(req: Request, res: Response) {
    const { id } = req.params;
    await this._reviewService.restoreReview(id);

    return ApiResponse.success(res, null, REVIEW_MESSAGES.RESTORED);
  }
}
