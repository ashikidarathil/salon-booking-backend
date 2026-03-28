export interface HolidayRequestDto {
  branchIds?: string[];
  date: string;
  name: string;
  isAllBranches: boolean;
}

export interface HolidayResponseDto {
  id: string;
  branchIds: string[];
  date: string;
  name: string;
  isAllBranches: boolean;
  createdAt: string;
  updatedAt: string;
}
