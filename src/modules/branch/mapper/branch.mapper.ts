import type { BranchDocument } from '../../../models/branch.model';
import type { BranchResponseDto } from '../dto/branch.response.dto';

export class BranchMapper {
  static toResponse(
    branch: BranchDocument,
    distance?: number,
  ): BranchResponseDto & { distance?: number } {
    return {
      id: branch._id.toString(),
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      latitude: branch.latitude,
      longitude: branch.longitude,
      isDeleted: branch.isDeleted,
      createdAt: branch.createdAt.toISOString(),
      updatedAt: branch.updatedAt.toISOString(),
      defaultBreaks: branch.defaultBreaks
        ? branch.defaultBreaks.map((gb) => ({
            startTime: gb.startTime,
            endTime: gb.endTime,
            description: gb.description,
          }))
        : undefined,
      ...(distance !== undefined && { distance }),
    };
  }
}
