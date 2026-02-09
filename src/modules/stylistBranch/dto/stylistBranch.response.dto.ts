export interface BranchStylistItemDto {
  mappingId: string;
  branchId: string;

  stylistId: string;
  userId: string;

  name: string;
  email?: string;
  phone?: string;

  specialization: string;
  experience: number;
  stylistStatus: 'ACTIVE' | 'INACTIVE';

  assignedAt: string;
}

export interface UnassignedStylistOptionDto {
  stylistId: string; // Stylist._id
  userId: string;

  name: string;
  email?: string;
  phone?: string;

  specialization: string;
  experience: number;
  stylistStatus: 'ACTIVE' | 'INACTIVE';
}
