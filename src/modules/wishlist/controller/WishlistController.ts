import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../common/types/express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { WishlistService } from '../service/WishlistService';
import { WISHLIST_MESSAGES } from '../constants/wishlist.constants';
import { WishlistToggleRequestDto } from '../dto/wishlist.dto';

@injectable()
export class WishlistController {
  constructor(@inject(TOKENS.WishlistService) private readonly _service: WishlistService) {}

  toggle = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) {
      return ApiResponse.error(res, WISHLIST_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const { stylistId } = req.body as WishlistToggleRequestDto;
    if (!stylistId) {
      return ApiResponse.error(res, WISHLIST_MESSAGES.STYLIST_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const isAdded = await this._service.toggleFavorite(userId, stylistId);
    const message = isAdded ? WISHLIST_MESSAGES.ADDED : WISHLIST_MESSAGES.REMOVED;

    return ApiResponse.success(res, { isAdded }, message);
  };

  getMyFavorites = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) {
      return ApiResponse.error(res, WISHLIST_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const { branchId } = req.query;
    const favorites = await this._service.getMyFavorites(userId, branchId as string);
    return ApiResponse.success(res, favorites, WISHLIST_MESSAGES.RETRIEVED);
  };
}
