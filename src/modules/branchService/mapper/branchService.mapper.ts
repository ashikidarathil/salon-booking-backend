export type BranchServiceItemResponse = {
  branchId: string;
  serviceId: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  price: number | null;
  duration: number | null;
  imageUrl?: string;
  description?: string;
  whatIncluded?: string[];
  isActive: boolean;
  configured: boolean;
};

export type BranchServiceStatusResponse = {
  branchId: string;
  serviceId: string;
  isActive: boolean;
};

export const BranchServiceMapper = {
  toItem(input: BranchServiceItemResponse): BranchServiceItemResponse {
    return input;
  },

  toStatus(input: BranchServiceStatusResponse): BranchServiceStatusResponse {
    return input;
  },
};
