import { IOffDayController } from './IOffDayController';
import { IOffDayService } from '../service/IOffDayService';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { OFF_DAY_MESSAGES } from '../constants/offDay.constants';
import { OffDayRequestDto, OffDayActionDto } from '../dto/offDay.dto';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: string;
  };
}

@injectable()
export class OffDayController implements IOffDayController {
  constructor(
    @inject(TOKENS.OffDayService)
    private readonly offDayService: IOffDayService,
  ) {}

  requestOffDay = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, 'Unauthorized'));
      return;
    }

    const dto: OffDayRequestDto = { ...req.body, stylistId: userId };
    const offDay = await this.offDayService.requestOffDay(dto);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, OFF_DAY_MESSAGES.CREATED, offDay));
  };

  getMyOffDays = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, 'Unauthorized'));
      return;
    }

    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const offDays = await this.offDayService.getOffDays(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, OFF_DAY_MESSAGES.FETCHED, offDays));
  };

  getStylistOffDays = async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const offDays = await this.offDayService.getOffDays(
      stylistId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, OFF_DAY_MESSAGES.FETCHED, offDays));
  };

  getAllOffDays = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const offDays = await this.offDayService.getAllOffDays(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, OFF_DAY_MESSAGES.FETCHED, offDays));
  };

  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.auth?.userId;
    if (!adminId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, 'Unauthorized'));
      return;
    }

    const dto: OffDayActionDto = req.body;
    const offDay = await this.offDayService.updateOffDayStatus(id, adminId, dto);
    res.status(HttpStatus.OK).json(new ApiResponse(true, OFF_DAY_MESSAGES.UPDATED, offDay));
  };

  deleteOffDay = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.offDayService.deleteOffDay(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, OFF_DAY_MESSAGES.DELETED));
  };
}
