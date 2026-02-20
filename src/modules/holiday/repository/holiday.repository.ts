import { IHoliday, HolidayModel } from '../../../models/holiday.model';
import { IHolidayRepository } from './IHolidayRepository';
import { injectable } from 'tsyringe';

@injectable()
export class HolidayRepository implements IHolidayRepository {
  async findById(id: string): Promise<IHoliday | null> {
    return await HolidayModel.findById(id);
  }

  async create(data: Partial<IHoliday>): Promise<IHoliday> {
    return await HolidayModel.create(data);
  }

  async findOne(filter: Record<string, unknown>): Promise<IHoliday | null> {
    return await HolidayModel.findOne(filter);
  }

  async find(filter: Record<string, unknown>): Promise<IHoliday[]> {
    return await HolidayModel.find(filter);
  }

  async delete(id: string): Promise<boolean> {
    const result = await HolidayModel.findByIdAndDelete(id);
    return !!result;
  }

  async findHolidaysInRange(branchId: string, startDate: Date, endDate: Date): Promise<IHoliday[]> {
    return await HolidayModel.find({
      $or: [{ branchId: null, isAllBranches: true }, { branchId: branchId }],
      date: { $gte: startDate, $lte: endDate },
    });
  }
}
