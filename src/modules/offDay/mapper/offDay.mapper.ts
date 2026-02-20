import { IStylistOffDay } from '../../../models/stylistOffDay.model';
import { OffDayResponseDto } from '../dto/offDay.dto';

export class OffDayMapper {
  static toResponse(offDay: IStylistOffDay): OffDayResponseDto {
    return {
      id: offDay._id.toString(),
      stylistId: offDay.stylistId.toString(),
      type: offDay.type,
      startDate: offDay.startDate.toISOString(),
      endDate: offDay.endDate.toISOString(),
      reason: offDay.reason,
      status: offDay.status,
      approvedBy: offDay.approvedBy?.toString(),
      approvedAt: offDay.approvedAt?.toISOString(),
      rejectionReason: offDay.rejectionReason,
      createdAt: offDay.createdAt.toISOString(),
      updatedAt: offDay.updatedAt.toISOString(),
    };
  }
}
