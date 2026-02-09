export type BranchCategoryItemResponse = {
  branchId: string;
  categoryId: string;
  name: string;
  isActive: boolean | null;
};

export const BranchCategoryMapper = {
  toItem(input: BranchCategoryItemResponse): BranchCategoryItemResponse {
    return input;
  },
};
