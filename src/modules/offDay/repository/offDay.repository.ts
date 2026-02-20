import { IStylistOffDay, StylistOffDayModel } from '../../../models/stylistOffDay.model';
import { IOffDayRepository } from './IOffDayRepository';
import { injectable } from 'tsyringe';
import { UpdateQuery } from 'mongoose';

@injectable()
export class OffDayRepository implements IOffDayRepository {
  async findById(id: string): Promise<IStylistOffDay | null> {
    return await StylistOffDayModel.findById(id);
  }

  async find(filter: Record<string, unknown>): Promise<IStylistOffDay[]> {
    return await StylistOffDayModel.find(filter);
  }

  async create(data: Partial<IStylistOffDay>): Promise<IStylistOffDay> {
    return await StylistOffDayModel.create(data);
  }

  async update(id: string, data: UpdateQuery<IStylistOffDay>): Promise<IStylistOffDay | null> {
    return await StylistOffDayModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await StylistOffDayModel.findByIdAndDelete(id);
    return !!result;
  }
}
