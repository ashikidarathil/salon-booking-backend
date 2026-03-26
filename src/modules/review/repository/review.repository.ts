import { injectable } from 'tsyringe';
import { ReviewModel, IReview } from '../../../models/review.model';
import { IReviewRepository } from './IReviewRepository';
import {
  CreateReviewDto,
  ReviewPaginationDto,
  TopServiceDto,
  TopStylistDto,
} from '../dto/review.schema';
import mongoose, { QueryFilter } from 'mongoose';
import { StylistModel } from '../../../models/stylist.model';
import { BaseRepository } from '../../../common/repository/baseRepository';

@injectable()
export class ReviewRepository
  extends BaseRepository<IReview, IReview>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  protected toEntity(doc: IReview): IReview {
    return doc;
  }

  async createReview(
    dto: CreateReviewDto & { userId: string; stylistId: string; serviceId: string },
  ): Promise<IReview> {
    return ReviewModel.create({
      userId: new mongoose.Types.ObjectId(dto.userId),
      bookingId: new mongoose.Types.ObjectId(dto.bookingId),
      stylistId: new mongoose.Types.ObjectId(dto.stylistId),
      serviceId: new mongoose.Types.ObjectId(dto.serviceId),
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  async findByBookingId(bookingId: string): Promise<IReview | null> {
    return this.findOne({ bookingId: new mongoose.Types.ObjectId(bookingId), isDeleted: false });
  }

  async listReviews(query: ReviewPaginationDto): Promise<{ reviews: IReview[]; total: number }> {
    const filter: QueryFilter<IReview> = {};
    if (!query.includeDeleted) {
      filter.isDeleted = false;
    }

    if (query.stylistId) {
      let stylist = await StylistModel.findById(query.stylistId);

      if (!stylist) {
        stylist = await StylistModel.findOne({ userId: query.stylistId });
      }

      if (stylist) {
        filter.stylistId = stylist._id;
      } else {
        try {
          filter.stylistId = new mongoose.Types.ObjectId(query.stylistId);
        } catch {
          filter.stylistId = query.stylistId;
        }
      }
    }

    if (query.serviceId) filter.serviceId = new mongoose.Types.ObjectId(query.serviceId);

    if (query.search) {
      filter.comment = { $regex: query.search, $options: 'i' };
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const total = await this.count(filter);
    const reviews = await this.find(filter, [{ path: 'userId', select: 'name profilePicture' }], {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    });

    return { reviews: reviews.slice((page - 1) * limit, page * limit), total };
  }

  async getStylistRating(
    stylistId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    let resolvedStylistId = stylistId;

    const stylist = await StylistModel.findOne({ userId: stylistId });
    if (stylist) {
      resolvedStylistId = stylist._id.toString();
    }

    const stats = await this._model.aggregate([
      {
        $match: {
          stylistId: new mongoose.Types.ObjectId(resolvedStylistId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || { averageRating: 0, totalReviews: 0 };
    return {
      averageRating: result.averageRating || 0,
      totalReviews: result.totalReviews || 0,
    };
  }

  async getServiceRating(
    serviceId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const stats = await this._model.aggregate([
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(serviceId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || { averageRating: 0, totalReviews: 0 };
    return {
      averageRating: result.averageRating || 0,
      totalReviews: result.totalReviews || 0,
    };
  }

  async getTopStylists(limit: number): Promise<TopStylistDto[]> {
    return this._model.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$stylistId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'stylists',
          localField: '_id',
          foreignField: '_id',
          as: 'stylistInfo',
        },
      },
      { $unwind: '$stylistInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'stylistInfo.userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          stylistId: '$_id',
          averageRating: 1,
          totalReviews: 1,
          stylistName: '$userInfo.name',
          avatar: '$userInfo.profilePicture',
          specialization: '$stylistInfo.specialization',
          bookingCount: '$totalReviews',
        },
      },
    ]);
  }

  async getTopServices(limit: number): Promise<TopServiceDto[]> {
    return this._model.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$serviceId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo',
        },
      },
      { $unwind: '$serviceInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'serviceInfo.categoryId',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          serviceId: '$_id',
          averageRating: 1,
          totalReviews: 1,
          serviceName: '$serviceInfo.name',
          imageUrl: '$serviceInfo.imageUrl',
          description: '$serviceInfo.description',
          categoryName: '$categoryInfo.name',
          bookingCount: '$totalReviews',
        },
      },
    ]);
  }

  async softDeleteReview(id: string): Promise<void> {
    await this.update(id, { isDeleted: true });
  }

  async restoreReview(id: string): Promise<void> {
    await this.update(id, { isDeleted: false });
  }
}
