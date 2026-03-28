import { IHolidayService } from './IHolidayService';
import { IHolidayRepository } from '../repository/IHolidayRepository';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { HolidayRequestDto, HolidayResponseDto } from '../dto/holiday.dto';
import { HolidayMapper } from '../mapper/holiday.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { HOLIDAY_MESSAGES } from '../constants/holiday.constants';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class HolidayService implements IHolidayService {
  constructor(
    @inject(TOKENS.HolidayRepository)
    private readonly holidayRepo: IHolidayRepository,
  ) {}

  async createHoliday(dto: HolidayRequestDto): Promise<HolidayResponseDto> {
    const holiday = await this.holidayRepo.create({
      branchIds: dto.isAllBranches ? [] : (dto.branchIds || []).map((id) => toObjectId(id)),
      date: new Date(dto.date),
      name: dto.name,
      isAllBranches: dto.isAllBranches,
    });
    return HolidayMapper.toResponse(holiday);
  }

  async getHolidays(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<HolidayResponseDto[]> {
    const filter: Record<string, unknown> = {};

    if (branchId) {
      filter.$or = [{ branchIds: toObjectId(branchId) }, { isAllBranches: true }];
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.date = dateFilter;
    }

    const holidays = await this.holidayRepo.find(filter);
    return holidays.map(HolidayMapper.toResponse);
  }

  async deleteHoliday(id: string): Promise<void> {
    const success = await this.holidayRepo.delete(id);
    if (!success) {
      throw new AppError(HOLIDAY_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }
}
