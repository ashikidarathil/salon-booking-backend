import {
  WeeklyScheduleRequestDto,
  WeeklyScheduleResponseDto,
  DailyOverrideRequestDto,
  DailyOverrideResponseDto,
  StylistBreakRequestDto,
  StylistBreakResponseDto,
} from '../dto/schedule.dto';

export interface IScheduleService {
  updateWeeklySchedule(dto: WeeklyScheduleRequestDto): Promise<WeeklyScheduleResponseDto>;
  getWeeklySchedule(stylistId: string, branchId: string): Promise<WeeklyScheduleResponseDto[]>;
  createDailyOverride(dto: DailyOverrideRequestDto): Promise<DailyOverrideResponseDto>;
  deleteDailyOverride(id: string): Promise<void>;
  getDailyOverrides(
    stylistId: string,
    branchId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DailyOverrideResponseDto[]>;

  // Break Management
  addBreak(dto: StylistBreakRequestDto): Promise<StylistBreakResponseDto>;
  deleteBreak(id: string): Promise<void>;
  getBreaks(stylistId: string, branchId: string): Promise<StylistBreakResponseDto[]>;
}
