import {
  IStylistWeeklySchedule,
  StylistWeeklyScheduleModel,
} from '../../../models/stylistWeeklySchedule.model';
import { IWeeklyScheduleRepository } from './IWeeklyScheduleRepository';
import { injectable } from 'tsyringe';
import { UpdateQuery } from 'mongoose';

@injectable()
export class WeeklyScheduleRepository implements IWeeklyScheduleRepository {
  async findById(id: string): Promise<IStylistWeeklySchedule | null> {
    return await StylistWeeklyScheduleModel.findById(id);
  }

  async findOne(filter: Record<string, unknown>): Promise<IStylistWeeklySchedule | null> {
    return await StylistWeeklyScheduleModel.findOne(filter);
  }

  async find(filter: Record<string, unknown>): Promise<IStylistWeeklySchedule[]> {
    return await StylistWeeklyScheduleModel.find(filter);
  }

  async create(data: Partial<IStylistWeeklySchedule>): Promise<IStylistWeeklySchedule> {
    return await StylistWeeklyScheduleModel.create(data);
  }

  async update(
    id: string,
    data: UpdateQuery<IStylistWeeklySchedule>,
  ): Promise<IStylistWeeklySchedule | null> {
    return await StylistWeeklyScheduleModel.findByIdAndUpdate(id, data, { new: true });
  }

  async save(schedule: IStylistWeeklySchedule): Promise<IStylistWeeklySchedule> {
    return await schedule.save();
  }
}
