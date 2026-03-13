import { AdminDashboardStatsDto, AdminStatsQueryDto } from '../dto/admin.stats.dto';

export interface IAdminDashboardService {
  getDashboardStats(query: AdminStatsQueryDto): Promise<AdminDashboardStatsDto>;
}
