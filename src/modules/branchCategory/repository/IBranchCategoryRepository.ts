import type { BranchCategoryDocument } from '../../../models/branchCategory.model';
import { CategoryLean } from '../type/categoryLean.types';

export interface IBranchCategoryRepository {
  findByBranchId(branchId: string): Promise<BranchCategoryDocument[]>;
  upsert(
    branchId: string,
    categoryId: string,
    isActive: boolean,
    updatedBy: string,
  ): Promise<BranchCategoryDocument>;

  findAllCategories(): Promise<CategoryLean[]>;
  findCategoryNameById(categoryId: string): Promise<string | null>;
}
