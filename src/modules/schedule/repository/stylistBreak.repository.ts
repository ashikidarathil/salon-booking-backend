import { IStylistBreakRepository } from './IStylistBreakRepository';
import { StylistBreakModel, IStylistBreak } from '../../../models/stylistBreak.model';
import { injectable } from 'tsyringe';

@injectable()
export class StylistBreakRepository implements IStylistBreakRepository {
  async create(data: Partial<IStylistBreak>): Promise<IStylistBreak> {
    return await StylistBreakModel.create(data);
  }

  async find(filter: Record<string, unknown>): Promise<IStylistBreak[]> {
    return await StylistBreakModel.find(filter).sort({ startTime: 1 });
  }

  async findOne(filter: Record<string, unknown>): Promise<IStylistBreak | null> {
    return await StylistBreakModel.findOne(filter);
  }

  async delete(id: string): Promise<boolean> {
    const result = await StylistBreakModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async save(entity: IStylistBreak): Promise<IStylistBreak> {
    return await entity.save();
  }
}
