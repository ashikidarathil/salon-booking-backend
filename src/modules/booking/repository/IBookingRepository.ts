import { BookingEntity } from '../../../common/types/bookingEntity';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PopulateOptions, UpdateQuery, ClientSession } from '../../../common/utils/mongoose.util';

export interface IBookingRepository {
  findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<BookingEntity>>;
  findById(id: string): Promise<BookingEntity | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: Record<string, 1 | -1>,
  ): Promise<BookingEntity[]>;
  findOne(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
  ): Promise<BookingEntity | null>;
  update(
    filter: Record<string, unknown>,
    data: UpdateQuery<unknown>,
    populate?: PopulateOptions[],
    session?: ClientSession,
  ): Promise<BookingEntity | null>;
  create(data: Partial<unknown>, session?: ClientSession): Promise<BookingEntity>;
  count(filter: Record<string, unknown>): Promise<number>;
}
