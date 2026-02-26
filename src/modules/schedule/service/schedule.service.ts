import { IScheduleService } from './IScheduleService';
import { IWeeklyScheduleRepository } from '../repository/IWeeklyScheduleRepository';
import { IDailyOverrideRepository } from '../repository/IDailyOverrideRepository';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import {
  WeeklyScheduleRequestDto,
  WeeklyScheduleResponseDto,
  DailyOverrideRequestDto,
  DailyOverrideResponseDto,
  StylistBreakRequestDto,
  StylistBreakResponseDto,
} from '../dto/schedule.dto';
import { ScheduleMapper } from '../mapper/schedule.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SCHEDULE_MESSAGES } from '../constants/schedule.constants';
import { IStylistWeeklySchedule } from '../../../models/stylistWeeklySchedule.model';
import { IStylistDailyOverride } from '../../../models/stylistDailyOverride.model';
import { IStylistBreakRepository } from '../repository/IStylistBreakRepository';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';
import mongoose from 'mongoose';

@injectable()
export class ScheduleService implements IScheduleService {
  constructor(
    @inject(TOKENS.WeeklyScheduleRepository)
    private readonly weeklyRepo: IWeeklyScheduleRepository,
    @inject(TOKENS.DailyOverrideRepository)
    private readonly dailyRepo: IDailyOverrideRepository,
    @inject(TOKENS.StylistBreakRepository)
    private readonly breakRepo: IStylistBreakRepository,
    @inject(TOKENS.StylistRepository)
    private readonly stylistRepo: IStylistRepository,
  ) {}

  private timeToMinutes(time: string): number {
    const [hrs, mins] = time.split(':').map(Number);
    return hrs * 60 + mins;
  }

  // Helper to resolve user ID to stylist ID
  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    if (!isValidObjectId(userIdOrStylistId)) {
      return userIdOrStylistId;
    }
    const stylistId = await this.stylistRepo.findIdByUserId(userIdOrStylistId);
    return stylistId || userIdOrStylistId;
  }

  async updateWeeklySchedule(dto: WeeklyScheduleRequestDto): Promise<WeeklyScheduleResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);
    let schedule = await this.weeklyRepo.findOne({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(dto.branchId),
      dayOfWeek: dto.dayOfWeek,
    });

    if (schedule) {
      schedule.isWorkingDay = dto.isWorkingDay;
      schedule.shifts = dto.shifts;
      schedule = await this.weeklyRepo.save(schedule);
    } else {
      schedule = await this.weeklyRepo.create({
        stylistId: toObjectId(stylistId),
        branchId: toObjectId(dto.branchId),
        dayOfWeek: dto.dayOfWeek,
        isWorkingDay: dto.isWorkingDay,
        shifts: dto.shifts,
      } as Partial<IStylistWeeklySchedule>);
    }

    return ScheduleMapper.toWeeklyResponse(schedule);
  }

  async getWeeklySchedule(
    userIdOrStylistId: string,
    branchId: string,
  ): Promise<WeeklyScheduleResponseDto[]> {
    const stylistId = await this.resolveStylistId(userIdOrStylistId);
    const schedules = await this.weeklyRepo.find({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(branchId),
    });
    return schedules.map(ScheduleMapper.toWeeklyResponse);
  }

  async createDailyOverride(dto: DailyOverrideRequestDto): Promise<DailyOverrideResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    // Remove existing override for the same date if any
    const existing = await this.dailyRepo.findOne({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(dto.branchId),
      date,
    });

    if (existing) {
      await this.dailyRepo.delete(existing._id.toString());
    }

    const override = await this.dailyRepo.create({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(dto.branchId),
      date,
      isWorkingDay: dto.isWorkingDay,
      shifts: dto.shifts,
      reason: dto.reason,
    } as Partial<IStylistDailyOverride>);

    return ScheduleMapper.toDailyResponse(override);
  }

  async deleteDailyOverride(id: string): Promise<void> {
    const success = await this.dailyRepo.delete(id);
    if (!success) {
      throw new AppError(SCHEDULE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  async getDailyOverrides(
    userIdOrStylistId: string,
    branchId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DailyOverrideResponseDto[]> {
    const stylistId = await this.resolveStylistId(userIdOrStylistId);
    const filter: Record<string, unknown> = {
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(branchId),
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.date = dateFilter;
    }

    const overrides = await this.dailyRepo.find(filter);
    return overrides.map(ScheduleMapper.toDailyResponse);
  }

  async addBreak(dto: StylistBreakRequestDto, userRole?: string): Promise<StylistBreakResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);

    // Enforce 2-break limit for non-admins
    if (userRole !== 'ADMIN') {
      const filter: {
        stylistId: mongoose.Types.ObjectId;
        branchId: mongoose.Types.ObjectId;
        date?: Date;
        dayOfWeek?: number;
      } = {
        stylistId: toObjectId(stylistId),
        branchId: toObjectId(dto.branchId),
      };

      if (dto.date) {
        filter.date = new Date(dto.date);
        filter.date.setUTCHours(0, 0, 0, 0);
      } else {
        filter.dayOfWeek = dto.dayOfWeek;
      }

      const existingBreaks = await this.breakRepo.find(filter as Record<string, unknown>);

      // Calculate total duration including the new break
      const newBreakDuration = this.timeToMinutes(dto.endTime) - this.timeToMinutes(dto.startTime);
      const existingDuration = existingBreaks.reduce(
        (sum, b) => sum + (this.timeToMinutes(b.endTime) - this.timeToMinutes(b.startTime)),
        0,
      );

      if (existingDuration + newBreakDuration > 90) {
        throw new AppError(
          (SCHEDULE_MESSAGES.BREAK_LIMIT_EXCEEDED as (mins: number) => string)(
            existingDuration + newBreakDuration,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const date = dto.date ? new Date(dto.date) : undefined;
    if (date) date.setUTCHours(0, 0, 0, 0);

    const stylistBreak = await this.breakRepo.create({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(dto.branchId),
      dayOfWeek: dto.dayOfWeek,
      date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      description: dto.description,
    });

    return ScheduleMapper.toBreakResponse(stylistBreak);
  }

  async deleteBreak(id: string): Promise<void> {
    const success = await this.breakRepo.delete(id);
    if (!success) {
      throw new AppError(SCHEDULE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  async getBreaks(userIdOrStylistId: string, branchId: string): Promise<StylistBreakResponseDto[]> {
    const stylistId = await this.resolveStylistId(userIdOrStylistId);
    const breaks = await this.breakRepo.find({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(branchId),
    });
    return breaks.map(ScheduleMapper.toBreakResponse);
  }
}
