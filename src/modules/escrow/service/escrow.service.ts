import { inject, injectable } from 'tsyringe';
import { IEscrowService } from './IEscrowService';
import { IEscrowRepository } from '../repository/IEscrowRepository';
import { IEscrow } from '../../../models/escrow.model';
import { EscrowStatus, ESCROW_MESSAGES } from '../constants/escrow.constants';
import { toObjectId, isValidObjectId, ObjectId } from '../../../common/utils/mongoose.util';
import { TOKENS } from '../../../common/di/tokens';
import { IStylistWalletService } from '../../stylistWallet/service/IStylistWalletService';
import { EscrowResponseDto } from '../dto/escrow.response.dto';
import { EscrowMapper } from '../mapper/escrow.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { resolveStylistId } from '../../booking/service/booking.helpers';
import { ISlotRepository } from '../../slot/repository/ISlotRepository';

// Helper to get ID string from potentially populated field or string/ObjectId
const getIdString = (ref: unknown): string => {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && ref !== null && '_id' in (ref as Record<string, unknown>)) {
    return String((ref as Record<string, unknown>)._id);
  }
  return String(ref);
};

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

@injectable()
export class EscrowService implements IEscrowService {
  constructor(
    @inject(TOKENS.EscrowRepository)
    private escrowRepository: IEscrowRepository,
    @inject(TOKENS.StylistWalletService)
    private stylistWalletService: IStylistWalletService,
    @inject(TOKENS.SlotRepository)
    private slotRepo: ISlotRepository,
  ) {}

  /**
   * Hold the full paid amount in escrow after the user pays the remaining 80%.
   * Creates a new escrow record for the booking with releaseMonth = current month.
   * Escrow is released on the 1st of the following month.
   */
  async holdAmount(bookingId: string, stylistId: string, amount: number): Promise<IEscrow> {
    const existing = await this.escrowRepository.findByBookingId(bookingId);
    if (existing) {
      throw new AppError(ESCROW_MESSAGES.ERROR.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    return this.escrowRepository.create({
      bookingId: toObjectId(bookingId),
      stylistId: toObjectId(stylistId),
      amount,
      status: EscrowStatus.HELD,
      releaseMonth: getCurrentMonth(),
    });
  }

  async getEscrowByBookingId(bookingId: string): Promise<EscrowResponseDto> {
    if (!isValidObjectId(bookingId)) {
      throw new AppError(ESCROW_MESSAGES.ERROR.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const escrow = await this.escrowRepository.findByBookingId(bookingId);
    if (!escrow) {
      throw new AppError(ESCROW_MESSAGES.ERROR.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return EscrowMapper.toResponseDto(escrow);
  }

  async getAllEscrows(query: PaginationQueryDto): Promise<PaginatedResponse<EscrowResponseDto>> {
    const result = await this.escrowRepository.findPaginated(query);
    const data = EscrowMapper.toResponseListDto(result.data);
    return {
      data,
      pagination: result.pagination,
    };
  }

  async getStylistEscrows(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>> {
    const stylistId = await resolveStylistId(userId, this.slotRepo);
    const filter: Record<string, unknown> = { stylistId: toObjectId(stylistId) };

    const result = await this.escrowRepository.findPaginated({
      ...query,
      ...filter,
    } as PaginationQueryDto);

    return {
      data: EscrowMapper.toResponseListDto(result.data),
      pagination: result.pagination,
    };
  }

  async getHeldBalance(userId: string): Promise<number> {
    const stylistId = await resolveStylistId(userId, this.slotRepo);
    const escrows = await this.escrowRepository.find({
      stylistId: toObjectId(stylistId),
      status: EscrowStatus.HELD,
    });
    
    const total = escrows.reduce((sum, e) => sum + e.amount, 0);
    return total;
  }

  async getAdminStylistEscrows(
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>> {
    const filter: Record<string, unknown> = { stylistId: toObjectId(stylistId) };

    const result = await this.escrowRepository.findPaginated({
      ...query,
      ...filter,
    } as PaginationQueryDto);

    return {
      data: EscrowMapper.toResponseListDto(result.data),
      pagination: result.pagination,
    };
  }

  /**
   * Called by cron on the 1st of every month.
   * Releases all HELD escrows whose releaseMonth is before the current month.
   * Credits the full amount to the stylist's wallet.
   */
  async releaseMonthlyEscrow(): Promise<void> {
    const currentMonth = getCurrentMonth();
    console.log(ESCROW_MESSAGES.LOGS.MONTHLY_RELEASE_START(currentMonth));

    const due = await this.escrowRepository.findHeldBeforeMonth(currentMonth);
    console.log(ESCROW_MESSAGES.LOGS.MONTHLY_RELEASE_FOUND(due.length));

    await Promise.allSettled(
      due.map(async (escrow) => {
        try {
          const bookingIdStr = getIdString(escrow.bookingId);
          const stylistIdStr = getIdString(escrow.stylistId);
          console.log(ESCROW_MESSAGES.LOGS.ATTEMPTING_RELEASE(bookingIdStr));

          await this.stylistWalletService.addEarnings(stylistIdStr, escrow.amount);
          await this.escrowRepository.updateStatus(
            getIdString(escrow._id),
            EscrowStatus.RELEASED,
          );

          console.log(ESCROW_MESSAGES.LOGS.SUCCESS_RELEASE(bookingIdStr));
        } catch (error) {
          const err = error as Error;
          console.error(
            ESCROW_MESSAGES.LOGS.FAIL_RELEASE(getIdString(escrow.bookingId), err.message),
          );
        }
      }),
    );
  }
}
