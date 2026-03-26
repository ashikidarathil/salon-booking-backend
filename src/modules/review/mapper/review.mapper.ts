import { injectable } from 'tsyringe';
import { IReview } from '../../../models/review.model';
import { ReviewResponseDto } from '../dto/review.schema';

@injectable()
export class ReviewMapper {
  toDto(review: IReview): ReviewResponseDto {
    const user = review.userId as unknown as {
      _id: string | { toString(): string };
      name?: string;
      profilePicture?: string;
    };
    const userId =
      user && typeof user === 'object' && '_id' in user ? user._id.toString() : String(user);
    const userName =
      user && typeof user === 'object' && 'name' in user && user.name
        ? user.name
        : 'Anonymous User';
    const profilePicture =
      user && typeof user === 'object' && 'profilePicture' in user
        ? user.profilePicture
        : undefined;

    return {
      id: review._id.toString(),
      userId: {
        _id: userId,
        name: userName,
        profilePicture,
      },
      bookingId: review.bookingId.toString(),
      stylistId: review.stylistId.toString(),
      serviceId: review.serviceId.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      isDeleted: review.isDeleted,
    };
  }

  toDtoList(reviews: IReview[]): ReviewResponseDto[] {
    return reviews.map((review) => this.toDto(review));
  }
}
