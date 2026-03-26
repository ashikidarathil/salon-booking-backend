import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IAdminDashboardService } from '../service/IAdminDashboardService';
import { ApiResponse } from '../../../common/response/apiResponse';
import { MESSAGES } from '../constants/messages';

@injectable()
export class AdminDashboardController {
  constructor(
    @inject(TOKENS.AdminDashboardService)
    private readonly _adminService: IAdminDashboardService,
  ) {}

  async getStats(req: Request, res: Response): Promise<Response> {
    const stats = await this._adminService.getDashboardStats({});
    return ApiResponse.success(res, stats, MESSAGES.ADMIN.DASHBOARD_STATS_FETCHED);
  }
}
