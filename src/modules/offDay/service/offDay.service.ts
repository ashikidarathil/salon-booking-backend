import { IOffDayService } from './IOffDayService';
import { IOffDayRepository } from '../repository/IOffDayRepository';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { OffDayRequestDto, OffDayResponseDto, OffDayActionDto } from '../dto/offDay.dto';
import { OffDayMapper } from '../mapper/offDay.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { OFF_DAY_MESSAGES } from '../constants/offDay.constants';
import { OffDayStatus, IStylistOffDay } from '../../../models/stylistOffDay.model';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class OffDayService implements IOffDayService {
  constructor(
    @inject(TOKENS.OffDayRepository)
    private readonly offDayRepo: IOffDayRepository,
    @inject(TOKENS.StylistRepository)
    private readonly stylistRepo: IStylistRepository,
  ) {}

  // Helper to resolve user ID to stylist ID
  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    if (!isValidObjectId(userIdOrStylistId)) {
      return userIdOrStylistId;
    }
    const stylistId = await this.stylistRepo.findIdByUserId(userIdOrStylistId);
    return stylistId || userIdOrStylistId;
  }

  async requestOffDay(dto: OffDayRequestDto): Promise<OffDayResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);

    // Validation: 3-day advance notice
    const startDate = new Date(dto.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);

    if (startDate < minDate) {
      throw new AppError(
        'Leave requests must be made at least 3 days in advance.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const offDay = await this.offDayRepo.create({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(dto.branchId),
      type: dto.type,
      startDate,
      endDate: new Date(dto.endDate),
      reason: dto.reason,
      status: OffDayStatus.PENDING,
    });
    return OffDayMapper.toResponse(offDay);
  }

  async getOffDays(
    userIdOrStylistId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<OffDayResponseDto[]> {
    const stylistId = await this.resolveStylistId(userIdOrStylistId);
    const filter: Record<string, unknown> = {
      stylistId: toObjectId(stylistId),
    };
    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.startDate = dateFilter;
    }
    const offDays = await this.offDayRepo.find(filter);
    return offDays.map(OffDayMapper.toResponse);
  }

  async getAllOffDays(startDate?: Date, endDate?: Date): Promise<OffDayResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.startDate = dateFilter;
    }
    const offDays = await this.offDayRepo.find(filter);
    return offDays.map(OffDayMapper.toResponse);
  }

  async updateOffDayStatus(
    id: string,
    adminId: string,
    dto: OffDayActionDto,
  ): Promise<OffDayResponseDto> {
    const offDay = await this.offDayRepo.findById(id);
    if (!offDay) {
      throw new AppError(OFF_DAY_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updateData: Partial<IStylistOffDay> = {
      status: dto.status,
      adminRemarks: dto.adminRemarks,
    };

    if (dto.status === OffDayStatus.APPROVED) {
      updateData.approvedBy = toObjectId(adminId);
      updateData.approvedAt = new Date();
    }

    const updated = await this.offDayRepo.update(id, updateData);
    if (!updated) {
      throw new AppError(OFF_DAY_MESSAGES.FAILED_STATUS, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return OffDayMapper.toResponse(updated);
  }

  async deleteOffDay(id: string): Promise<void> {
    const success = await this.offDayRepo.delete(id);
    if (!success) {
      throw new AppError(OFF_DAY_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }
}
