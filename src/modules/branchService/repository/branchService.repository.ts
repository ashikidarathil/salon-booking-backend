import { BranchServiceModel } from '../../../models/branchService.model';
import type { IBranchServiceRepository } from './IBranchServiceRepository';

export class BranchServiceRepository implements IBranchServiceRepository {
  findByBranchId(branchId: string) {
    return BranchServiceModel.find({ branchId }).sort({ createdAt: -1 });
  }

  upsert(
    branchId: string,
    serviceId: string,
    payload: { price: number; duration: number; isActive: boolean },
    updatedBy: string,
  ) {
    return BranchServiceModel.findOneAndUpdate(
      { branchId, serviceId },
      { branchId, serviceId, ...payload, updatedBy },
      { new: true, upsert: true },
    );
  }

  toggleStatus(branchId: string, serviceId: string, isActive: boolean, updatedBy: string) {
    return BranchServiceModel.findOneAndUpdate(
      { branchId, serviceId },
      { isActive, updatedBy },
      { new: true, upsert: true },
    );
  }
  findOne(branchId: string, serviceId: string) {
    return BranchServiceModel.findOne({ branchId, serviceId });
  }
}
