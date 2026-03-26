import { inject, injectable } from 'tsyringe';
import { IEscrowService } from './IEscrowService';
import { IEscrowRepository } from '../repository/IEscrowRepository';
import { IEscrow } from '../../../models/escrow.model';
import { EscrowStatus, ESCROW_MESSAGES, getCurrentDateString } from '../constants/escrow.constants';
import { toObjectId, isValidObjectId, getIdString } from '../../../common/utils/mongoose.util';
import { TOKENS } from '../../../common/di/tokens';
import { IStylistWalletService } from '../../stylistWallet/service/IStylistWalletService';
import { EscrowResponseDto } from '../dto/escrow.response.dto';
import { EscrowMapper } from '../mapper/escrow.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { EscrowPaginationQueryDto } from '../dto/escrow.request.dto';
import { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { resolveStylistId } from '../../booking/service/booking.helpers';
import { ISlotRepository } from '../../slot/repository/ISlotRepository';

interface PopulatedStylistForRelease {
  userId: string | { toString(): string };
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
      releaseDate: getCurrentDateString(),
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

  async getAllEscrows(
    query: EscrowPaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>> {
    const result = await this.escrowRepository.findPaginated(query);
    return {
      data: EscrowMapper.toResponseListDto(result.data),
      pagination: result.pagination,
    };
  }

  async getStylistEscrows(
    userId: string,
    query: EscrowPaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>> {
    const stylistId = await resolveStylistId(userId, this.slotRepo);
    const result = await this.escrowRepository.findPaginated({
      ...query,
      stylistId,
    });

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
    return escrows.reduce((sum, e) => sum + e.amount, 0);
  }

  async getAdminStylistEscrows(
    stylistId: string,
    query: EscrowPaginationQueryDto,
  ): Promise<PaginatedResponse<EscrowResponseDto>> {
    const result = await this.escrowRepository.findPaginated({
      ...query,
      stylistId,
    });

    return {
      data: EscrowMapper.toResponseListDto(result.data),
      pagination: result.pagination,
    };
  }

  async releaseDailyEscrow(): Promise<void> {
    const currentDate = getCurrentDateString();
    const due = await this.escrowRepository.findHeldBeforeDate(currentDate);

    await Promise.allSettled(
      due.map(async (escrow) => {
        const stylistDoc = escrow.stylistId as unknown as PopulatedStylistForRelease;
        const userIdStr = getIdString(stylistDoc.userId);

        await this.stylistWalletService.addEarnings(userIdStr, escrow.amount);
        await this.escrowRepository.updateStatus(getIdString(escrow._id), EscrowStatus.RELEASED);
      }),
    );
  }
}
