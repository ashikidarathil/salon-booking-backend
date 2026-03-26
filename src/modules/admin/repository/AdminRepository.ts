import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { IEscrowRepository } from '../../escrow/repository/IEscrowRepository';
import { IAdminRepository } from './IAdminRepository';
import { AdminStatsQueryDto } from '../dto/admin.dto';
import { BookingStatus } from '../../../models/booking.model';
import { EscrowStatus } from '../../../models/escrow.model';
import { AdminRawStatsData } from './IAdminRepository';

@injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
    @inject(TOKENS.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(TOKENS.EscrowRepository)
    private readonly escrowRepo: IEscrowRepository,
  ) {}

  async getStats(_query: AdminStatsQueryDto): Promise<AdminRawStatsData> {
    const [allBookings, allUsers, escrowItems] = await Promise.all([
      this.bookingRepo.find(
        {
          status: {
            $in: [
              BookingStatus.COMPLETED,
              BookingStatus.CONFIRMED,
              BookingStatus.CANCELLED,
              BookingStatus.PENDING_PAYMENT,
            ],
          },
        },
        [],
      ),
      this.userRepo.findAll({}),
      this.escrowRepo.find({ status: EscrowStatus.HELD }),
    ]);

    return {
      allBookings,
      allUsers,
      escrowItems,
    };
  }
}
