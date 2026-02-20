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
  constructor(@inject(TOKENS.StylistService) private readonly _service: IStylistService) {}

  async list(req: AuthRequest, res: Response): Promise<void> {
    const data = await this._service.listAllWithInviteStatus();
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.STYLISTS_LISTED, data));
  }

  async getStylists(req: Request, res: Response): Promise<void> {
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      ...(typeof req.query.status === 'string' && { status: req.query.status }),
      ...(typeof req.query.isBlocked === 'string' && {
        isBlocked: req.query.isBlocked === 'true',
      }),
      ...(typeof req.query.isActive === 'string' && {
        isActive: req.query.isActive === 'true',
      }),
      ...(typeof req.query.position === 'string' && {
        position: req.query.position,
      }),
    };

    const result = await this._service.getPaginatedStylists(query);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Stylists retrieved successfully', result));
  }

  async toggleBlock(req: Request, res: Response): Promise<void> {
    const stylistId = req.params.stylistId;

    if (typeof req.body.isBlocked !== 'boolean') {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, 'isBlocked must be boolean'));
      return;
    }

    const result = await this._service.toggleBlockStylist(stylistId, req.body.isBlocked);

    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json(new ApiResponse<void>(false, 'Stylist not found'));
      return;
    }

    const message = req.body.isBlocked ? 'Stylist blocked' : 'Stylist unblocked';

    res.status(HttpStatus.OK).json(new ApiResponse(true, message, { success: true }));
  }

  async updatePosition(req: Request, res: Response): Promise<void> {
    const stylistId = req.params.stylistId;
    const { position } = req.body;

    if (!['JUNIOR', 'SENIOR', 'TRAINEE'].includes(position)) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, 'Invalid position. Must be JUNIOR, SENIOR, or TRAINEE'));
      return;
    }

    const result = await this._service.updateStylistPosition(stylistId, position);

    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json(new ApiResponse<void>(false, 'Stylist not found'));
      return;
    }

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Stylist position updated successfully', result));
  }

  async getPublicStylists(req: Request, res: Response): Promise<void> {
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      branchId: typeof req.query.branchId === 'string' ? req.query.branchId : undefined,
      position: typeof req.query.position === 'string' ? req.query.position : undefined,
    };

    const result = await this._service.getPublicStylists(query);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Stylists retrieved successfully', result));
  }

  async getPublicStylistById(req: Request, res: Response): Promise<void> {
    const stylistId = req.params.stylistId;
    const result = await this._service.getPublicStylistById(stylistId);

    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json(new ApiResponse<void>(false, 'Stylist not found'));
      return;
    }

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Stylist retrieved successfully', result));
  }
}
