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

  createHoliday = async (req: Request, res: Response) => {
    const dto: HolidayRequestDto = req.body;
    const holiday = await this.holidayService.createHoliday(dto);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, HOLIDAY_MESSAGES.CREATED, holiday));
  };

  getHolidays = async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const holidays = await this.holidayService.getHolidays(branchId, start, end);
    res.status(HttpStatus.OK).json(new ApiResponse(true, HOLIDAY_MESSAGES.FETCHED, holidays));
  };

  deleteHoliday = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.holidayService.deleteHoliday(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, HOLIDAY_MESSAGES.DELETED));
  };
}
