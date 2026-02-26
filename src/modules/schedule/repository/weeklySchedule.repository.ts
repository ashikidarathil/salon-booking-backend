import {
  IStylistWeeklySchedule,
  StylistWeeklyScheduleModel,
} from '../../../models/stylistWeeklySchedule.model';
import { IWeeklyScheduleRepository } from './IWeeklyScheduleRepository';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';

@injectable()
export class WeeklyScheduleRepository
  extends BaseRepository<IStylistWeeklySchedule, IStylistWeeklySchedule>
  implements IWeeklyScheduleRepository
{
  constructor() {
    super(StylistWeeklyScheduleModel);
  }

  protected toEntity(doc: IStylistWeeklySchedule): IStylistWeeklySchedule {
    return doc;
  }
}
