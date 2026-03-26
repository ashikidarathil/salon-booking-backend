import { IHolidayController } from './IHolidayController';
import { IHolidayService } from '../service/IHolidayService';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { HOLIDAY_MESSAGES } from '../constants/holiday.constants';
import { HolidayRequestDto } from '../dto/holiday.dto';

@injectable()
export class HolidayController implements IHolidayController {
  constructor(
    @inject(TOKENS.HolidayService)
    private readonly holidayService: IHolidayService,
  ) {}

  async createHoliday(req: Request, res: Response): Promise<Response> {
    const dto: HolidayRequestDto = req.body;
    const holiday = await this.holidayService.createHoliday(dto);
    return ApiResponse.success(res, holiday, HOLIDAY_MESSAGES.CREATED, HttpStatus.CREATED);
  }

  async getHolidays(req: Request, res: Response): Promise<Response> {
    const branchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const holidays = await this.holidayService.getHolidays(branchId, start, end);
    return ApiResponse.success(res, holidays, HOLIDAY_MESSAGES.FETCHED);
  }

  deleteHoliday = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.holidayService.deleteHoliday(id);
    return ApiResponse.success(res, undefined, HOLIDAY_MESSAGES.DELETED);
  };
}
