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
import { StylistModel } from '../../../models/stylist.model';
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
  ) {}

  // Helper to resolve user ID to stylist ID
  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    const stylistByUserId = await StylistModel.findOne({ userId: userIdOrStylistId })
      .select('_id')
      .lean();
    if (stylistByUserId && stylistByUserId._id) {
      return stylistByUserId._id.toString();
    }
    return userIdOrStylistId;
  }

  async updateWeeklySchedule(dto: WeeklyScheduleRequestDto): Promise<WeeklyScheduleResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);
    let schedule = await this.weeklyRepo.findOne({
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(dto.branchId),
      dayOfWeek: dto.dayOfWeek,
    });

    if (schedule) {
      schedule.isWorkingDay = dto.isWorkingDay;
      schedule.shifts = dto.shifts;
      schedule = await this.weeklyRepo.save(schedule);
    } else {
      schedule = await this.weeklyRepo.create({
        stylistId: new mongoose.Types.ObjectId(stylistId),
        branchId: new mongoose.Types.ObjectId(dto.branchId),
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
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(branchId),
    });
    return schedules.map(ScheduleMapper.toWeeklyResponse);
  }

  async createDailyOverride(dto: DailyOverrideRequestDto): Promise<DailyOverrideResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    // Remove existing override for the same date if any
    const existing = await this.dailyRepo.findOne({
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(dto.branchId),
      date,
    });

    if (existing) {
      await this.dailyRepo.delete(existing._id.toString());
    }

    const override = await this.dailyRepo.create({
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(dto.branchId),
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
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(branchId),
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

  async addBreak(dto: StylistBreakRequestDto): Promise<StylistBreakResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);
    const date = dto.date ? new Date(dto.date) : undefined;
    if (date) date.setUTCHours(0, 0, 0, 0);

    const stylistBreak = await this.breakRepo.create({
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(dto.branchId),
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
      stylistId: new mongoose.Types.ObjectId(stylistId),
      branchId: new mongoose.Types.ObjectId(branchId),
    });
    return breaks.map(ScheduleMapper.toBreakResponse);
  }
}
