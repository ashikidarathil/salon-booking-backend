import { StylistServiceModel } from '../../../models/stylistService.model';
import type { IStylistServiceRepository } from './IStylistServiceRepository';

export class StylistServiceRepository implements IStylistServiceRepository {
  async findByStylistId(stylistId: string) {
    return StylistServiceModel.find({ stylistId }).sort({ createdAt: -1 });
  }

  async toggleStatus(stylistId: string, serviceId: string, isActive: boolean, updatedBy: string) {
    return StylistServiceModel.findOneAndUpdate(
      { stylistId, serviceId },
      { isActive, updatedBy },
      { new: true, upsert: true },
    );
  }

  async findOne(stylistId: string, serviceId: string) {
    return StylistServiceModel.findOne({ stylistId, serviceId });
  }
}
