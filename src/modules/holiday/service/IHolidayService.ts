import { HolidayRequestDto, HolidayResponseDto } from '../dto/holiday.dto';

export interface IHolidayService {
  createHoliday(dto: HolidayRequestDto): Promise<HolidayResponseDto>;
  getHolidays(branchId?: string, startDate?: Date, endDate?: Date): Promise<HolidayResponseDto[]>;
  deleteHoliday(id: string): Promise<void>;
}
