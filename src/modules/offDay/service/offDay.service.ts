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
import mongoose from 'mongoose';

@injectable()
export class OffDayService implements IOffDayService {
  constructor(
    @inject(TOKENS.OffDayRepository)
    private readonly offDayRepo: IOffDayRepository,
  ) {}

  async requestOffDay(dto: OffDayRequestDto): Promise<OffDayResponseDto> {
    const offDay = await this.offDayRepo.create({
      stylistId: new mongoose.Types.ObjectId(dto.stylistId),
      branchId: new mongoose.Types.ObjectId(dto.branchId),
      type: dto.type,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reason: dto.reason,
      status: OffDayStatus.PENDING,
    } as Partial<IStylistOffDay>);
    return OffDayMapper.toResponse(offDay);
  }

  async getOffDays(
    stylistId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<OffDayResponseDto[]> {
    const filter: Record<string, unknown> = {
      stylistId: new mongoose.Types.ObjectId(stylistId),
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

    offDay.status = dto.status;
    if (dto.status === OffDayStatus.APPROVED) {
      offDay.approvedBy = new mongoose.Types.ObjectId(adminId);
      offDay.approvedAt = new Date();
    } else {
      offDay.rejectionReason = dto.rejectionReason;
    }

    const updated = await this.offDayRepo.update(id, offDay);
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
