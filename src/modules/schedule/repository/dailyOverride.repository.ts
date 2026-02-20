import {
  IStylistDailyOverride,
  StylistDailyOverrideModel,
} from '../../../models/stylistDailyOverride.model';
import { IDailyOverrideRepository } from './IDailyOverrideRepository';
import { injectable } from 'tsyringe';
import { UpdateQuery } from 'mongoose';

@injectable()
export class DailyOverrideRepository implements IDailyOverrideRepository {
  async findById(id: string): Promise<IStylistDailyOverride | null> {
    return await StylistDailyOverrideModel.findById(id);
  }

  async findOne(filter: Record<string, unknown>): Promise<IStylistDailyOverride | null> {
    return await StylistDailyOverrideModel.findOne(filter);
  }

  async find(filter: Record<string, unknown>): Promise<IStylistDailyOverride[]> {
    return await StylistDailyOverrideModel.find(filter);
  }

  async create(data: Partial<IStylistDailyOverride>): Promise<IStylistDailyOverride> {
    return await StylistDailyOverrideModel.create(data);
  }

  async update(
    id: string,
    data: UpdateQuery<IStylistDailyOverride>,
  ): Promise<IStylistDailyOverride | null> {
    return await StylistDailyOverrideModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await StylistDailyOverrideModel.findByIdAndDelete(id);
    return !!result;
  }
}
