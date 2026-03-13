import { IBooking } from '../../../models/booking.model';
import { PopulateOptions, UpdateQuery, ClientSession } from '../../../common/utils/mongoose.util';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IBookingRepository {
  create(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking>;
  findById(id: string): Promise<IBooking | null>;
  findOne(filter: Record<string, unknown>, populate?: PopulateOptions[]): Promise<IBooking | null>;
  find(filter: Record<string, unknown>, populate?: PopulateOptions[], sort?: Record<string, 1 | -1>): Promise<IBooking[]>;
  findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<IBooking>>;
  update(
    filter: Record<string, unknown>,
    data: UpdateQuery<IBooking>,
    populate?: PopulateOptions[],
    session?: ClientSession,
  ): Promise<IBooking | null>;
  count(filter: Record<string, unknown>): Promise<number>;
}
