import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IAdminRepository } from '../repository/IAdminRepository';
import { AdminMapper } from '../mapper/AdminMapper';
import { IAdminDashboardService } from './IAdminDashboardService';
import { AdminDashboardStatsDto, AdminStatsQueryDto } from '../dto/admin.stats.dto';

@injectable()
export class AdminDashboardService implements IAdminDashboardService {
  constructor(
    @inject(TOKENS.AdminRepository)
    private readonly adminRepo: IAdminRepository,
    @inject(TOKENS.AdminMapper)
    private readonly mapper: AdminMapper,
  ) {}

  async getDashboardStats(query: AdminStatsQueryDto): Promise<AdminDashboardStatsDto> {
    const data = await this.adminRepo.getStats(query);
    return this.mapper.toDashboardStatsDto(data, query);
  }
}
