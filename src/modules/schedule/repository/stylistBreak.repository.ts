import { IStylistBreakRepository } from './IStylistBreakRepository';
import { StylistBreakModel, IStylistBreak } from '../../../models/stylistBreak.model';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/repository/baseRepository';
import { PopulateOptions } from 'mongoose';

@injectable()
export class StylistBreakRepository
  extends BaseRepository<IStylistBreak, IStylistBreak>
  implements IStylistBreakRepository
{
  constructor() {
    super(StylistBreakModel);
  }

  protected toEntity(doc: IStylistBreak): IStylistBreak {
    return doc;
  }

  override async find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
    sort: Record<string, 1 | -1> = { startTime: 1 },
  ): Promise<IStylistBreak[]> {
    return super.find(filter, populate, sort);
  }
}
