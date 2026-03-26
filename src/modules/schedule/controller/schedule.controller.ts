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

  updateWeekly = async (req: Request, res: Response): Promise<Response> => {
    const { dayOfWeek } = req.params;
    const dto: WeeklyScheduleRequestDto = {
      ...req.body,
      dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : req.body.dayOfWeek,
    };
    const schedule = await this.scheduleService.updateWeeklySchedule(dto);
    return ApiResponse.success(res, schedule, SCHEDULE_MESSAGES.WEEKLY_UPDATED);
  };

  getWeekly = async (req: Request, res: Response): Promise<Response> => {
    const { stylistId } = req.params;
    const { branchId } = req.query as { branchId: string };
    const schedules = await this.scheduleService.getWeeklySchedule(stylistId, branchId);
    return ApiResponse.success(res, schedules, SCHEDULE_MESSAGES.WEEKLY_FETCHED);
  };

  createDailyOverride = async (req: Request, res: Response): Promise<Response> => {
    const dto: DailyOverrideRequestDto = req.body;
    const override = await this.scheduleService.createDailyOverride(dto);
    return ApiResponse.success(res, override, SCHEDULE_MESSAGES.OVERRIDE_CREATED);
  };

  deleteDailyOverride = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.scheduleService.deleteDailyOverride(id);
    return ApiResponse.success(res, undefined, SCHEDULE_MESSAGES.OVERRIDE_DELETED);
  };

  getDailyOverrides = async (req: Request, res: Response): Promise<Response> => {
    const { stylistId } = req.params;
    const { branchId, startDate, endDate } = req.query as {
      branchId: string;
      startDate?: string;
      endDate?: string;
    };

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const overrides = await this.scheduleService.getDailyOverrides(stylistId, branchId, start, end);
    return ApiResponse.success(res, overrides, SCHEDULE_MESSAGES.OVERRIDE_FETCHED);
  };

  addBreak = async (req: Request, res: Response): Promise<Response> => {
    const dto = req.body;
    const authReq = req as AuthenticatedRequest;
    const role = authReq.auth?.role;
    const stylistBreak = await this.scheduleService.addBreak(dto, role);
    return ApiResponse.success(
      res,
      stylistBreak,
      SCHEDULE_MESSAGES.BREAK_ADDED,
      HttpStatus.CREATED,
    );
  };

  deleteBreak = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.scheduleService.deleteBreak(id);
    return ApiResponse.success(res, undefined, SCHEDULE_MESSAGES.BREAK_DELETED);
  };

  getBreaks = async (req: Request, res: Response): Promise<Response> => {
    const { stylistId } = req.params;
    const { branchId } = req.query as { branchId: string };
    const breaks = await this.scheduleService.getBreaks(stylistId, branchId);
    return ApiResponse.success(res, breaks, SCHEDULE_MESSAGES.BREAK_FETCHED);
  };
}
