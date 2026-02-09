export interface CreateBranchDto {
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}
