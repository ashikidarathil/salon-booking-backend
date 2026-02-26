export interface CreateBranchDto {
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  defaultBreaks?: Array<{
    startTime: string;
    endTime: string;
    description: string;
  }>;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  defaultBreaks?: Array<{
    startTime: string;
    endTime: string;
    description: string;
  }>;
}
