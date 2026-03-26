import { EscrowResponseDto } from '../dto/escrow.response.dto';
import { EscrowPaginationQueryDto } from '../dto/escrow.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { IEscrow } from '../../../models/escrow.model';

export interface IEscrowService {
  holdAmount(bookingId: string, stylistId: string, amount: number): Promise<IEscrow>;
  getEscrowByBookingId(bookingId: string): Promise<EscrowResponseDto>;
  getAllEscrows(query: EscrowPaginationQueryDto): Promise<PaginatedResponse<EscrowResponseDto>>;
  getStylistEscrows(
    userId: string,
    query: EscrowPaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>>;
  getHeldBalance(userId: string): Promise<number>;
  getAdminStylistEscrows(
    stylistId: string,
    query: EscrowPaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>>;
  releaseDailyEscrow(): Promise<void>;
}
