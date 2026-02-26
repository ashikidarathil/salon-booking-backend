import { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { STYLIST_SERVICE_MESSAGES } from '../constants/stylistService.messages';
import type { IStylistServiceService } from '../service/IStylistServiceService';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { AuthenticatedRequest } from '../../../common/types/express';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ToggleStylistServiceStatusRequestDto } from '../dto/stylistService.dto';

@injectable()
export class StylistServiceController {
  constructor(
    @inject(TOKENS.StylistServiceService)
    private readonly _service: IStylistServiceService,
  ) {}

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { role, userId } = req.auth || {};
    const { branchId } = req.query as { branchId?: string };

    if (role === 'STYLIST' && userId !== req.params.stylistId) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json(ApiResponse.error(STYLIST_SERVICE_MESSAGES.UNAUTHORIZED));
      return;
    }

    const data = await this._service.list(req.params.stylistId, branchId);
    res.json(ApiResponse.success(STYLIST_SERVICE_MESSAGES.LISTED, data));
  };

  toggleStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = req.auth?.userId;
    if (!adminId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error(STYLIST_SERVICE_MESSAGES.UNAUTHORIZED));
      return;
    }

    const data = await this._service.toggleStatus(
      req.params.stylistId,
      req.params.serviceId,
      req.body as ToggleStylistServiceStatusRequestDto,
      adminId,
    );
    res.json(ApiResponse.success(STYLIST_SERVICE_MESSAGES.STATUS_UPDATED, data));
  };

  listPaginated = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = req.query as unknown as PaginationQueryDto;
    const data = await this._service.listPaginated(req.params.stylistId, query);
    res.json(ApiResponse.success(STYLIST_SERVICE_MESSAGES.LISTED, data));
  };

  getStylistsByService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await this._service.getStylistsByService(req.params.serviceId);
    res.json(ApiResponse.success(STYLIST_SERVICE_MESSAGES.LISTED, data));
  };
}
