export interface HolidayRequestDto {
  branchId?: string | null;
  date: string;
  name: string;
  isAllBranches: boolean;
}

export interface HolidayResponseDto {
  id: string;
  branchId?: string | null;
  date: string;
  name: string;
  isAllBranches: boolean;
  createdAt: string;
  updatedAt: string;
}
