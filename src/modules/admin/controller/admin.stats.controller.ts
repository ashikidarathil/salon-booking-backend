import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IAdminDashboardService } from '../service/IAdminDashboardService';
import { AdminStatsQueryDto } from '../dto/admin.stats.dto';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

@injectable()
export class AdminDashboardController {
  constructor(
    @inject(TOKENS.AdminDashboardService)
    private readonly adminStatsService: IAdminDashboardService,
  ) {}

  getStats = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AdminStatsQueryDto;
    const stats = await this.adminStatsService.getDashboardStats(query);
    res.status(HttpStatus.OK).json(ApiResponse.success('Admin dashboard stats fetched successfully', stats));
  };
}
