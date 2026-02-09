import type { StylistBranchDocument } from '../../../models/stylistBranch.model';

export interface IStylistBranchRepository {
  findActiveByStylistId(stylistId: string): Promise<StylistBranchDocument | null>;
  findActiveByBranchId(branchId: string): Promise<StylistBranchDocument[]>;
  createAssignment(
    stylistId: string,
    branchId: string,
    assignedBy: string,
  ): Promise<StylistBranchDocument>;
  deactivateAssignment(stylistId: string, branchId: string): Promise<StylistBranchDocument | null>;
  deactivateAnyActiveAssignment(stylistId: string): Promise<StylistBranchDocument | null>;
}
