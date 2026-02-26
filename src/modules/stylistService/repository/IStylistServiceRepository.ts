import { StylistServiceDocument } from '../../../models/stylistService.model';
import { PopulateOptions, UpdateQuery } from 'mongoose';

export interface IStylistServiceRepository {
  findById(id: string, populate?: PopulateOptions[]): Promise<StylistServiceDocument | null>;
  find(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
  ): Promise<StylistServiceDocument[]>;
  findOne(
    filter: Record<string, unknown>,
    populate?: PopulateOptions[],
  ): Promise<StylistServiceDocument | null>;
  create(data: Partial<StylistServiceDocument>): Promise<StylistServiceDocument>;
  update(
    id: string,
    data: UpdateQuery<StylistServiceDocument>,
  ): Promise<StylistServiceDocument | null>;
  delete(id: string): Promise<boolean>;
  findByStylistId(stylistId: string): Promise<StylistServiceDocument[]>;
  findByServiceId(serviceId: string): Promise<StylistServiceDocument[]>;
  toggleStatus(
    stylistId: string,
    serviceId: string,
    isActive: boolean,
    updatedBy: string,
  ): Promise<StylistServiceDocument | null>;
}
