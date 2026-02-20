import { IStylistDailyOverride } from '../../../models/stylistDailyOverride.model';
import { UpdateQuery } from 'mongoose';

export interface IDailyOverrideRepository {
  findById(id: string): Promise<IStylistDailyOverride | null>;
  findOne(filter: Record<string, unknown>): Promise<IStylistDailyOverride | null>;
  find(filter: Record<string, unknown>): Promise<IStylistDailyOverride[]>;
  create(data: Partial<IStylistDailyOverride>): Promise<IStylistDailyOverride>;
  update(
    id: string,
    data: UpdateQuery<IStylistDailyOverride>,
  ): Promise<IStylistDailyOverride | null>;
  delete(id: string): Promise<boolean>;
}
