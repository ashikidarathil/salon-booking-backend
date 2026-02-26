import {
  IStylistDailyOverride,
  StylistDailyOverrideModel,
} from '../../../models/stylistDailyOverride.model';
import { IDailyOverrideRepository } from './IDailyOverrideRepository';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';

@injectable()
export class DailyOverrideRepository
  extends BaseRepository<IStylistDailyOverride, IStylistDailyOverride>
  implements IDailyOverrideRepository
{
  constructor() {
    super(StylistDailyOverrideModel);
  }

  protected toEntity(doc: IStylistDailyOverride): IStylistDailyOverride {
    return doc;
  }
}
