import { IStylistOffDay } from '../../../models/stylistOffDay.model';
import { PopulateOptions, UpdateQuery } from 'mongoose';
import { SortOptions } from '../../../common/repository/baseRepository';

export interface IOffDayRepository {
  findById(id: string, populate?: PopulateOptions[]): Promise<IStylistOffDay | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort?: SortOptions,
  ): Promise<IStylistOffDay[]>;
  findOne(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
  ): Promise<IStylistOffDay | null>;
  create(data: Partial<IStylistOffDay>): Promise<IStylistOffDay>;
  update(id: string, data: UpdateQuery<IStylistOffDay>): Promise<IStylistOffDay | null>;
  delete(id: string): Promise<boolean>;
  save(doc: IStylistOffDay): Promise<IStylistOffDay>;
}
