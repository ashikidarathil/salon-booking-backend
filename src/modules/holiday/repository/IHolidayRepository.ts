import { PopulateOptions } from 'mongoose';
import { IHoliday } from '../../../models/holiday.model';
import { SortOptions } from '../../../common/repository/baseRepository';

export interface IHolidayRepository {
  findById(id: string, populate?: PopulateOptions[]): Promise<IHoliday | null>;
  findOne(filter: Record<string, unknown>, populate?: PopulateOptions[]): Promise<IHoliday | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<IHoliday[]>;
  create(data: Partial<IHoliday>): Promise<IHoliday>;
  delete(id: string): Promise<boolean>;
  findHolidaysInRange(branchId: string, startDate: Date, endDate: Date): Promise<IHoliday[]>;
}
