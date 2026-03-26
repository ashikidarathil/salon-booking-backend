import type { Response, Request } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import type { IStylistService } from '../service/IStylistService';
import { AuthRequest } from '../type/AuthRequest';
import { STYLIST_INVITE_MESSAGES } from '../constants/stylistInvite.messages';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class StylistController {
  constructor(
    @inject(TOKENS.StylistManagementService) private readonly _service: IStylistService,
  ) {}

  async list(req: AuthRequest, res: Response): Promise<Response> {
    const data = await this._service.listAllWithInviteStatus();
    return ApiResponse.success(res, data, STYLIST_INVITE_MESSAGES.STYLISTS_LISTED);
  }

  async getStylists(req: Request, res: Response): Promise<Response> {
    const result = await this._service.getPaginatedStylists(
      req.query as unknown as PaginationQueryDto,
    );

    return ApiResponse.success(res, result, STYLIST_INVITE_MESSAGES.STYLISTS_LISTED);
  }

  async toggleBlock(req: Request, res: Response): Promise<Response> {
    const stylistId = req.params.stylistId;

    if (typeof req.body.isBlocked !== 'boolean') {
      return ApiResponse.error(
        res,
        STYLIST_INVITE_MESSAGES.IS_BLOCKED_BOOLEAN,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this._service.toggleBlockStylist(stylistId, req.body.isBlocked);

    if (!result) {
      return ApiResponse.error(
        res,
        STYLIST_INVITE_MESSAGES.STYLIST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const message = req.body.isBlocked
      ? STYLIST_INVITE_MESSAGES.STYLIST_BLOCKED
      : STYLIST_INVITE_MESSAGES.STYLIST_UNBLOCKED;

    return ApiResponse.success(res, { success: true }, message);
  }

  async updatePosition(req: Request, res: Response): Promise<Response> {
    const stylistId = req.params.stylistId;
    const { position } = req.body;

    if (!['JUNIOR', 'SENIOR', 'TRAINEE'].includes(position)) {
      return ApiResponse.error(
        res,
        STYLIST_INVITE_MESSAGES.INVALID_POSITION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this._service.updateStylistPosition(stylistId, position);

    if (!result) {
      return ApiResponse.error(
        res,
        STYLIST_INVITE_MESSAGES.STYLIST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return ApiResponse.success(res, result, STYLIST_INVITE_MESSAGES.POSITION_UPDATED);
  }

  async getPublicStylists(req: Request, res: Response): Promise<Response> {
    const result = await this._service.getPublicStylists(
      req.query as unknown as PaginationQueryDto,
      (req as AuthRequest).auth?.userId,
    );

    return ApiResponse.success(res, result, STYLIST_INVITE_MESSAGES.STYLISTS_LISTED);
  }

  async getPublicStylistById(req: Request, res: Response): Promise<Response> {
    const stylistId = req.params.stylistId;
    const result = await this._service.getPublicStylistById(
      stylistId,
      (req as AuthRequest).auth?.userId,
    );

    if (!result) {
      return ApiResponse.error(
        res,
        STYLIST_INVITE_MESSAGES.STYLIST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return ApiResponse.success(res, result, STYLIST_INVITE_MESSAGES.STYLIST_FETCHED);
  }
}
