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

  list = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const { role, userId } = req.auth || {};
    const { branchId } = req.query as { branchId?: string };

    if (role === 'STYLIST' && userId !== req.params.stylistId) {
      return ApiResponse.error(res, STYLIST_SERVICE_MESSAGES.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    const data = await this._service.list(req.params.stylistId, branchId);
    return ApiResponse.success(res, data, STYLIST_SERVICE_MESSAGES.LISTED);
  };

  toggleStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const adminId = req.auth?.userId;
    if (!adminId) {
      return ApiResponse.error(res, STYLIST_SERVICE_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const data = await this._service.toggleStatus(
      req.params.stylistId,
      req.params.serviceId,
      req.body as ToggleStylistServiceStatusRequestDto,
      adminId,
    );
    return ApiResponse.success(res, data, STYLIST_SERVICE_MESSAGES.STATUS_UPDATED);
  };

  listPaginated = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as PaginationQueryDto;
    const data = await this._service.listPaginated(req.params.stylistId, query);
    return ApiResponse.success(res, data, STYLIST_SERVICE_MESSAGES.LISTED);
  };

  getStylistsByService = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const data = await this._service.getStylistsByService(req.params.serviceId);
    return ApiResponse.success(res, data, STYLIST_SERVICE_MESSAGES.LISTED);
  };
}
