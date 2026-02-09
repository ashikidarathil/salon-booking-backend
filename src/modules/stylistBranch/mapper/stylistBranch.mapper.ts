import type {
  BranchStylistItemDto,
  UnassignedStylistOptionDto,
} from '../dto/stylistBranch.response.dto';

export class StylistBranchMapper {
  static toBranchStylistItem(input: {
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
    assignedAt: Date;
  }): BranchStylistItemDto {
    return {
      mappingId: input.mappingId,
      branchId: input.branchId,
      stylistId: input.stylistId,
      userId: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      specialization: input.specialization,
      experience: input.experience,
      stylistStatus: input.stylistStatus,
      assignedAt: input.assignedAt.toISOString(),
    };
  }

  static toUnassignedOption(input: {
    stylistId: string;
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    specialization: string;
    experience: number;
    stylistStatus: 'ACTIVE' | 'INACTIVE';
  }): UnassignedStylistOptionDto {
    return {
      stylistId: input.stylistId,
      userId: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      specialization: input.specialization,
      experience: input.experience,
      stylistStatus: input.stylistStatus,
    };
  }
}
