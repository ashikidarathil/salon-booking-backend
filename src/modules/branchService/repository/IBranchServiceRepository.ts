import type { BranchServiceDocument } from '../../../models/branchService.model';

export interface IBranchServiceRepository {
  findByBranchId(branchId: string): Promise<BranchServiceDocument[]>;
  findOne(branchId: string, serviceId: string): Promise<BranchServiceDocument | null>;
  upsert(
    branchId: string,
    serviceId: string,
    payload: { price: number; duration: number; isActive: boolean },
    updatedBy: string,
  ): Promise<BranchServiceDocument>;
  toggleStatus(
    branchId: string,
    serviceId: string,
    isActive: boolean,
    updatedBy: string,
  ): Promise<BranchServiceDocument>;
}
