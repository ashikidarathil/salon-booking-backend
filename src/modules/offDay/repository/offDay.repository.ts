import { IStylistOffDay, StylistOffDayModel } from '../../../models/stylistOffDay.model';
import { IOffDayRepository } from './IOffDayRepository';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';

@injectable()
export class OffDayRepository
  extends BaseRepository<IStylistOffDay, IStylistOffDay>
  implements IOffDayRepository
{
  constructor() {
    super(StylistOffDayModel);
  }

  protected toEntity(doc: IStylistOffDay): IStylistOffDay {
    return doc;
  }
}
