import { IOffDayController } from './IOffDayController';
import { IOffDayService } from '../service/IOffDayService';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { OFF_DAY_MESSAGES } from '../constants/offDay.constants';
import { OffDayRequestDto, OffDayActionDto } from '../dto/offDay.dto';
import { AuthenticatedRequest } from '../../../common/types/express';

@injectable()
export class OffDayController implements IOffDayController {
  constructor(
    @inject(TOKENS.OffDayService)
    private readonly offDayService: IOffDayService,
  ) {}

  requestOffDay = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    if (!userId) {
      return ApiResponse.error(res, OFF_DAY_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const dto: OffDayRequestDto = { ...req.body, stylistId: userId };
    const offDay = await this.offDayService.requestOffDay(dto);
    return ApiResponse.success(res, offDay, OFF_DAY_MESSAGES.CREATED, HttpStatus.CREATED);
  };

  getMyOffDays = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    if (!userId) {
      return ApiResponse.error(res, OFF_DAY_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const offDays = await this.offDayService.getOffDays(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return ApiResponse.success(res, offDays, OFF_DAY_MESSAGES.FETCHED);
  };

  getStylistOffDays = async (req: Request, res: Response): Promise<Response> => {
    const { stylistId } = req.params;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const offDays = await this.offDayService.getOffDays(
      stylistId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return ApiResponse.success(res, offDays, OFF_DAY_MESSAGES.FETCHED);
  };

  getAllOffDays = async (req: Request, res: Response): Promise<Response> => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const offDays = await this.offDayService.getAllOffDays(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return ApiResponse.success(res, offDays, OFF_DAY_MESSAGES.FETCHED);
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.auth?.userId;
    if (!adminId) {
      return ApiResponse.error(res, OFF_DAY_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const dto: OffDayActionDto = req.body;
    const offDay = await this.offDayService.updateOffDayStatus(id, adminId, dto);
    return ApiResponse.success(res, offDay, OFF_DAY_MESSAGES.UPDATED);
  };

  deleteOffDay = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.offDayService.deleteOffDay(id);
    return ApiResponse.success(res, undefined, OFF_DAY_MESSAGES.DELETED);
  };
}
