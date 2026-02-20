import { IStylistBreak } from '../../../models/stylistBreak.model';

export interface IStylistBreakRepository {
  create(data: Partial<IStylistBreak>): Promise<IStylistBreak>;
  find(filter: Record<string, unknown>): Promise<IStylistBreak[]>;
  findOne(filter: Record<string, unknown>): Promise<IStylistBreak | null>;
  delete(id: string): Promise<boolean>;
  save(entity: IStylistBreak): Promise<IStylistBreak>;
}
