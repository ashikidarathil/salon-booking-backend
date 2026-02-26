export interface BranchResponseDto {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  defaultBreaks?: Array<{
    startTime: string;
    endTime: string;
    description: string;
  }>;
}

export interface BranchWithDistanceDto extends BranchResponseDto {
  distance?: number;
}
