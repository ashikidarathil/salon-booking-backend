import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '../../../common/response/apiResponse';
import { IUserController } from './IUserController';
import { IUserAdminService } from '../service/IUserAdminService';
import { TOKENS } from '../../../common/di/tokens';
import { ToggleBlockUserDto, UserPaginationQueryDto } from '../dto/admin.dto';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../constants/messages';
import { UserRole } from '../../../common/enums/userRole.enum';

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TOKENS.UserAdminService) private readonly _adminService: IUserAdminService) {}

  async getProfile(req: Request & { auth?: { userId: string } }, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(MESSAGES.ADMIN.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const admin = await this._adminService.getProfile(userId);
    return ApiResponse.success(res, admin, MESSAGES.ADMIN.ADMIN_PROFILE_FETCHED_SUCCESSFULLY);
  }

  async getDashboardStats(req: Request, res: Response) {
    const stats = await this._adminService.getDashboardStats();
    return ApiResponse.success(res, stats, MESSAGES.ADMIN.DASHBOARD_STATS_FETCHED);
  }

  async toggleBlock(req: Request, res: Response): Promise<Response> {
    const userId = req.params.userId;
    const dto = req.body as ToggleBlockUserDto;

    await this._adminService.toggleBlockUser(userId, dto.isBlocked);

    const message = dto.isBlocked ? MESSAGES.ADMIN.USER_BLOCKED : MESSAGES.ADMIN.USER_UNBLOCKED;

    return ApiResponse.success(res, { success: true }, message);
  }

  async getUsers(req: Request, res: Response): Promise<Response> {
    const query = {
      ...req.query,
      role: UserRole.USER,
    } as unknown as UserPaginationQueryDto;

    const result = await this._adminService.getUsers(query);

    return ApiResponse.success(res, result, MESSAGES.ADMIN.USERS_RETRIEVED);
  }
}
