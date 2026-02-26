import { IHoliday } from '../../../models/holiday.model';
import { HolidayResponseDto } from '../dto/holiday.dto';

export class HolidayMapper {
  static toResponse(holiday: IHoliday): HolidayResponseDto {
    return {
      id: String(holiday._id),
      branchId: holiday.branchId?.toString() || null,
      date: holiday.date.toISOString(),
      name: holiday.name,
      isAllBranches: holiday.isAllBranches,
      createdAt: holiday.createdAt.toISOString(),
      updatedAt: holiday.updatedAt.toISOString(),
    };
  }
}
