import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { IEscrow } from '../../../models/escrow.model';
import { EscrowResponseDto } from '../dto/escrow.dto';

export interface IEscrowService {
  holdAmount(bookingId: string, stylistId: string, amount: number): Promise<IEscrow>;
  getEscrowByBookingId(bookingId: string): Promise<EscrowResponseDto>;
  getAllEscrows(query: PaginationQueryDto): Promise<PaginatedResponse<EscrowResponseDto>>;
  getStylistEscrows(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>>;
  getHeldBalance(userId: string): Promise<number>;
  getAdminStylistEscrows(
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>>;
  releaseMonthlyEscrow(): Promise<void>;
}
