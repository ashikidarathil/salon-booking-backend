import { IHoliday, HolidayModel } from '../../../models/holiday.model';
import { IHolidayRepository } from './IHolidayRepository';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class HolidayRepository
  extends BaseRepository<IHoliday, IHoliday>
  implements IHolidayRepository
{
  constructor() {
    super(HolidayModel);
  }

  protected toEntity(doc: IHoliday): IHoliday {
    return doc;
  }

  async findHolidaysInRange(branchId: string, startDate: Date, endDate: Date): Promise<IHoliday[]> {
    return await HolidayModel.find({
      $or: [{ branchId: null, isAllBranches: true }, { branchId: toObjectId(branchId) }],
      date: { $gte: startDate, $lte: endDate },
    });
  }
}
