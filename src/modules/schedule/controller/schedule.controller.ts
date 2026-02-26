import { IScheduleController } from './IScheduleController';
import { IScheduleService } from '../service/IScheduleService';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SCHEDULE_MESSAGES } from '../constants/schedule.constants';
import { WeeklyScheduleRequestDto, DailyOverrideRequestDto } from '../dto/schedule.dto';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: string;
  };
}

@injectable()
export class ScheduleController implements IScheduleController {
  constructor(
    @inject(TOKENS.ScheduleService)
    private readonly scheduleService: IScheduleService,
  ) {}

  updateWeekly = async (req: Request, res: Response) => {
    const { dayOfWeek } = req.params;
    const dto: WeeklyScheduleRequestDto = {
      ...req.body,
      dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : req.body.dayOfWeek,
    };
    const schedule = await this.scheduleService.updateWeeklySchedule(dto);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, SCHEDULE_MESSAGES.WEEKLY_UPDATED, schedule));
  };

  getWeekly = async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { branchId } = req.query as { branchId: string };
    const schedules = await this.scheduleService.getWeeklySchedule(stylistId, branchId);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, SCHEDULE_MESSAGES.WEEKLY_FETCHED, schedules));
  };

  createDailyOverride = async (req: Request, res: Response) => {
    const dto: DailyOverrideRequestDto = req.body;
    const override = await this.scheduleService.createDailyOverride(dto);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, SCHEDULE_MESSAGES.OVERRIDE_CREATED, override));
  };

  deleteDailyOverride = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.scheduleService.deleteDailyOverride(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SCHEDULE_MESSAGES.OVERRIDE_DELETED));
  };

  getDailyOverrides = async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { branchId, startDate, endDate } = req.query as {
      branchId: string;
      startDate?: string;
      endDate?: string;
    };

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const overrides = await this.scheduleService.getDailyOverrides(stylistId, branchId, start, end);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, SCHEDULE_MESSAGES.OVERRIDE_FETCHED, overrides));
  };

  addBreak = async (req: Request, res: Response) => {
    const dto = req.body;
    const authReq = req as AuthenticatedRequest;
    const role = authReq.auth?.role;
    const stylistBreak = await this.scheduleService.addBreak(dto, role);
    res
      .status(HttpStatus.CREATED)
      .json(new ApiResponse(true, SCHEDULE_MESSAGES.BREAK_ADDED, stylistBreak));
  };

  deleteBreak = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.scheduleService.deleteBreak(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SCHEDULE_MESSAGES.BREAK_DELETED));
  };

  getBreaks = async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { branchId } = req.query as { branchId: string };
    const breaks = await this.scheduleService.getBreaks(stylistId, branchId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SCHEDULE_MESSAGES.BREAK_FETCHED, breaks));
  };
}
