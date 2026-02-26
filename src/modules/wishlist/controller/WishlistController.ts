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

  toggle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, WISHLIST_MESSAGES.UNAUTHORIZED));
      return;
    }

    const { stylistId } = req.body as WishlistToggleRequestDto;
    if (!stylistId) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse(false, WISHLIST_MESSAGES.STYLIST_REQUIRED));
      return;
    }

    const isAdded = await this._service.toggleFavorite(userId, stylistId);
    const message = isAdded ? WISHLIST_MESSAGES.ADDED : WISHLIST_MESSAGES.REMOVED;

    res.status(HttpStatus.OK).json(new ApiResponse(true, message, { isAdded }));
  };

  getMyFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, WISHLIST_MESSAGES.UNAUTHORIZED));
      return;
    }

    const { branchId } = req.query;
    const favorites = await this._service.getMyFavorites(userId, branchId as string);
    res.status(HttpStatus.OK).json(new ApiResponse(true, WISHLIST_MESSAGES.RETRIEVED, favorites));
  };
}
