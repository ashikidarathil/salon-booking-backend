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
}
