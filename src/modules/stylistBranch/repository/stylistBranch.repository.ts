import { StylistBranchModel } from '../../../models/stylistBranch.model';
import type { IStylistBranchRepository } from './IStylistBranchRepository';

export class StylistBranchRepository implements IStylistBranchRepository {
  findActiveByStylistId(stylistId: string) {
    return StylistBranchModel.findOne({ stylistId, isActive: true });
  }

  findActiveByBranchId(branchId: string) {
    return StylistBranchModel.find({ branchId, isActive: true }).sort({ createdAt: -1 });
  }

  createAssignment(stylistId: string, branchId: string, assignedBy: string) {
    return StylistBranchModel.create({
      stylistId,
      branchId,
      assignedBy,
      isActive: true,
      assignedAt: new Date(),
      unassignedAt: null,
    });
  }

  deactivateAssignment(stylistId: string, branchId: string) {
    return StylistBranchModel.findOneAndUpdate(
      { stylistId, branchId, isActive: true },
      { isActive: false, unassignedAt: new Date() },
      { new: true },
    );
  }

  deactivateAnyActiveAssignment(stylistId: string) {
    return StylistBranchModel.findOneAndUpdate(
      { stylistId, isActive: true },
      { isActive: false, unassignedAt: new Date() },
      { new: true },
    );
  }
}
