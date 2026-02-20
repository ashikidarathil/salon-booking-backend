import { IHoliday } from '../../../models/holiday.model';

export interface IHolidayRepository {
  findById(id: string): Promise<IHoliday | null>;
  findOne(filter: Record<string, unknown>): Promise<IHoliday | null>;
  find(filter: Record<string, unknown>): Promise<IHoliday[]>;
  create(data: Partial<IHoliday>): Promise<IHoliday>;
  delete(id: string): Promise<boolean>;
  findHolidaysInRange(branchId: string, startDate: Date, endDate: Date): Promise<IHoliday[]>;
}
