export type UpsertBranchServiceRequestDto = {
  price: number;
  duration: number;
  isActive?: boolean;
};

export type ToggleBranchServiceStatusRequestDto = {
  isActive: boolean;
};
