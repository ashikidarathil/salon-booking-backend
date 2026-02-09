import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../constants/messages';
import type { IUserController } from './IUserController';
import type { IUserAdminService } from '../service/IUserAdminService';
import { TOKENS } from '../../../common/di/tokens';
import type { ToggleBlockUserDto, ToggleBlockUserResponseDto } from '../dto/ToggleBlock.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TOKENS.UserAdminService) private readonly _service: IUserAdminService) {}

  async toggleBlock(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;

    const dto: ToggleBlockUserDto = {
      isBlocked: req.body.isBlocked,
    };

    if (typeof dto.isBlocked !== 'boolean') {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, MESSAGES.ADMIN.INVALID_BLOCK_STATUS));
      return;
    }

    await this._service.toggleBlockUser(userId, dto.isBlocked);

    const message = dto.isBlocked ? MESSAGES.ADMIN.USER_BLOCKED : MESSAGES.ADMIN.USER_UNBLOCKED;

    const responseDto: ToggleBlockUserResponseDto = {
      success: true,
      message,
    };

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse<ToggleBlockUserResponseDto>(true, message, responseDto));
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    const roleParam = req.query.role;
    const role = typeof roleParam === 'string' ? roleParam : 'USER';
    const isActiveParam = req.query.isActive;
    const isActive = typeof isActiveParam === 'string' ? isActiveParam === 'true' : undefined;

    const isBlockedParam = req.query.isBlocked;
    const isBlocked = typeof isBlockedParam === 'string' ? isBlockedParam === 'true' : undefined;

    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',

      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(isBlocked !== undefined && { isBlocked }),
    };

    const result = await this._service.getUsers(query);

    console.log('USERS RESULT:', result);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Users retrieved successfully', result));
  }
}
