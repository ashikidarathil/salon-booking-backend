import { injectable } from 'tsyringe';
import { IPlatformRevenue, PlatformRevenueModel } from '../../../models/platformRevenue.model';

import { BaseRepository } from '../../../common/repository/baseRepository';

@injectable()
export class PlatformRevenueRepository extends BaseRepository<IPlatformRevenue, IPlatformRevenue> {
  constructor() {
    super(PlatformRevenueModel);
  }

  protected toEntity(doc: IPlatformRevenue): IPlatformRevenue {
    return doc;
  }

  async getTotalRevenue(): Promise<number> {
    const result = await PlatformRevenueModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async findAll(): Promise<IPlatformRevenue[]> {
    return PlatformRevenueModel.find().sort({ createdAt: -1 }).lean();
  }
}
