import { BranchCategoryModel } from '../../../models/branchCategory.model';
import type { IBranchCategoryRepository } from './IBranchCategoryRepository';
import { CategoryModel } from '../../../models/category.model';
import type { CategoryLean } from '../type/categoryLean.types';

export class BranchCategoryRepository implements IBranchCategoryRepository {
  findByBranchId(branchId: string) {
    return BranchCategoryModel.find({ branchId }).sort({ createdAt: -1 });
  }

  upsert(branchId: string, categoryId: string, isActive: boolean, updatedBy: string) {
    return BranchCategoryModel.findOneAndUpdate(
      { branchId, categoryId },
      { branchId, categoryId, isActive, updatedBy },
      { new: true, upsert: true },
    );
  }

  findAllCategories(): Promise<CategoryLean[]> {
    return CategoryModel.find().select('name isDeleted').lean();
  }

  async findCategoryNameById(categoryId: string): Promise<string | null> {
    const category = await CategoryModel.findById(categoryId).select('name').lean();

    return category?.name ?? null;
  }
}
