import { IEscrow, EscrowStatus } from '../../../models/escrow.model';
import { SortOptions } from '../../../common/repository/baseRepository';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { PopulateOptions, UpdateQuery, ClientSession } from '../../../common/utils/mongoose.util';

export interface IEscrowRepository {
  create(data: Partial<IEscrow>, session?: ClientSession): Promise<IEscrow>;
  findById(id: string): Promise<IEscrow | null>;
  findByBookingId(bookingId: string): Promise<IEscrow | null>;
  update(
    filter: Record<string, unknown>,
    data: UpdateQuery<IEscrow>,
    populate?: PopulateOptions[],
  ): Promise<IEscrow | null>;
  updateStatus(id: string, status: EscrowStatus, session?: ClientSession): Promise<IEscrow | null>;
  findHeldBeforeMonth(currentMonth: string): Promise<IEscrow[]>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<IEscrow[]>;
  findPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<IEscrow>>;
}
