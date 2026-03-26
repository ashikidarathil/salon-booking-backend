import { BookingEntity } from '../../../common/types/bookingEntity';
import { UserEntity } from '../../../common/types/userEntity';
import { IEscrow } from '../../../models/escrow.model';
import { AdminStatsQueryDto } from '../dto/admin.dto';

export interface AdminRawStatsData {
  allBookings: BookingEntity[];
  allUsers: UserEntity[];
  escrowItems: IEscrow[];
}

export interface IAdminRepository {
  getStats(query: AdminStatsQueryDto): Promise<AdminRawStatsData>;
}
