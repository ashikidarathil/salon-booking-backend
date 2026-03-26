import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IReviewRepository } from '../repository/IReviewRepository';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { INotificationService } from '../../notification/service/INotificationService';
import { IReviewService } from './IReviewService';
import { IReview } from '../../../models/review.model';
import { ReviewMapper } from '../mapper/review.mapper';
import {
  CreateReviewDto,
  ReviewPaginationDto,
  ReviewResponseDto,
  TopStylistDto,
  TopServiceDto,
} from '../dto/review.schema';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BookingStatus } from '../../../models/booking.model';
import { NotificationType } from '../../../models/notification.model';
import { getIdString } from '../../../common/utils/mongoose.util';
import { REVIEW_MESSAGES } from '../constants/review.messages';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { IServiceRepository } from '../../service/repository/IServiceRepository';

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject(TOKENS.ReviewRepository) private readonly _reviewRepo: IReviewRepository,
    @inject(TOKENS.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TOKENS.NotificationService) private readonly _notificationService: INotificationService,
    @inject(TOKENS.ReviewMapper) private readonly _mapper: ReviewMapper,
    @inject(TOKENS.StylistRepository) private readonly _stylistRepo: IStylistRepository,
    @inject(TOKENS.ServiceRepository) private readonly _serviceRepo: IServiceRepository,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const booking = await this._bookingRepo.findById(dto.bookingId);

    if (!booking) {
      throw new AppError(REVIEW_MESSAGES.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const bookingUserId = getIdString(booking.userId);
    if (bookingUserId !== userId) {
      throw new AppError(REVIEW_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError(REVIEW_MESSAGES.NOT_COMPLETED, HttpStatus.BAD_REQUEST);
    }

    const existingReview = await this._reviewRepo.findByBookingId(dto.bookingId);
    if (existingReview) {
      throw new AppError(REVIEW_MESSAGES.ALREADY_REVIEWED, HttpStatus.CONFLICT);
    }

    const stylistId = getIdString(booking.stylistId);
    const serviceId = getIdString(booking.items[0].serviceId);

    const review = await this._reviewRepo.createReview({
      ...dto,
      userId,
      stylistId,
      serviceId,
    });

    // Notify Stylist
    await this._notificationService.createNotification({
      recipientId: stylistId,
      title: 'New Review Received',
      message: `A client left a ${dto.rating}-star review for your service.`,
      type: NotificationType.SYSTEM,
    });

    // Update Stylist Stats
    const stylistStats = await this.getStylistRating(stylistId);
    await this._stylistRepo.update(stylistId, {
      rating: stylistStats.averageRating,
      reviewCount: stylistStats.totalReviews,
    });

    // Update Service Stats
    const serviceStats = await this.getServiceRating(serviceId);
    await this._serviceRepo.update(serviceId, {
      rating: serviceStats.averageRating,
      reviewCount: serviceStats.totalReviews,
    });

    return this._mapper.toDto(review);
  }

  async getReviewById(id: string): Promise<IReview> {
    const review = await this._reviewRepo.findById(id);
    if (!review) throw new AppError(REVIEW_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    return review;
  }

  async listReviews(
    query: ReviewPaginationDto,
  ): Promise<{ reviews: ReviewResponseDto[]; total: number }> {
    const { reviews, total } = await this._reviewRepo.listReviews(query);
    return {
      reviews: this._mapper.toDtoList(reviews),
      total,
    };
  }

  async getStylistRating(
    stylistId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    return this._reviewRepo.getStylistRating(stylistId);
  }

  async getServiceRating(
    serviceId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    return this._reviewRepo.getServiceRating(serviceId);
  }

  async getTopStylists(limit: number = 5): Promise<TopStylistDto[]> {
    return this._reviewRepo.getTopStylists(limit);
  }

  async getTopServices(limit: number = 5): Promise<TopServiceDto[]> {
    return this._reviewRepo.getTopServices(limit);
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this._reviewRepo.findById(id);
    if (!review) {
      throw new AppError(REVIEW_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._reviewRepo.softDeleteReview(id);

    // Recalculate Stylist Stats
    const stylistId = getIdString(review.stylistId);
    const stylistStats = await this.getStylistRating(stylistId);
    await this._stylistRepo.update(stylistId, {
      rating: stylistStats.averageRating,
      reviewCount: stylistStats.totalReviews,
    });

    // Recalculate Service Stats
    const serviceId = getIdString(review.serviceId);
    const serviceStats = await this.getServiceRating(serviceId);
    await this._serviceRepo.update(serviceId, {
      rating: serviceStats.averageRating,
      reviewCount: serviceStats.totalReviews,
    });
  }

  async restoreReview(id: string): Promise<void> {
    const review = await this._reviewRepo.findById(id);
    if (!review) {
      throw new AppError(REVIEW_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._reviewRepo.restoreReview(id);

    // Recalculate Stylist Stats
    const stylistId = getIdString(review.stylistId);
    const stylistStats = await this.getStylistRating(stylistId);
    await this._stylistRepo.update(stylistId, {
      rating: stylistStats.averageRating,
      reviewCount: stylistStats.totalReviews,
    });

    // Recalculate Service Stats
    const serviceId = getIdString(review.serviceId);
    const serviceStats = await this.getServiceRating(serviceId);
    await this._serviceRepo.update(serviceId, {
      rating: serviceStats.averageRating,
      reviewCount: serviceStats.totalReviews,
    });
  }
}
