import { IStylistWeeklySchedule } from '../../../models/stylistWeeklySchedule.model';
import { UpdateQuery } from 'mongoose';

export interface IWeeklyScheduleRepository {
  findById(id: string): Promise<IStylistWeeklySchedule | null>;
  findOne(filter: Record<string, unknown>): Promise<IStylistWeeklySchedule | null>;
  find(filter: Record<string, unknown>): Promise<IStylistWeeklySchedule[]>;
  create(data: Partial<IStylistWeeklySchedule>): Promise<IStylistWeeklySchedule>;
  update(
    id: string,
    data: UpdateQuery<IStylistWeeklySchedule>,
  ): Promise<IStylistWeeklySchedule | null>;
  save(schedule: IStylistWeeklySchedule): Promise<IStylistWeeklySchedule>;
}
