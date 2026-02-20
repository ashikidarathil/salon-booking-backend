import { IStylistOffDay } from '../../../models/stylistOffDay.model';
import { UpdateQuery } from 'mongoose';

export interface IOffDayRepository {
  findById(id: string): Promise<IStylistOffDay | null>;
  find(filter: Record<string, unknown>): Promise<IStylistOffDay[]>;
  create(data: Partial<IStylistOffDay>): Promise<IStylistOffDay>;
  update(id: string, data: UpdateQuery<IStylistOffDay>): Promise<IStylistOffDay | null>;
  delete(id: string): Promise<boolean>;
}
