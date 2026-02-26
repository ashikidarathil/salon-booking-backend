import { IStylistOffDay } from '../../../models/stylistOffDay.model';
import { OffDayResponseDto } from '../dto/offDay.dto';

export class OffDayMapper {
  static toResponse(offDay: IStylistOffDay): OffDayResponseDto {
    return {
      id: String(offDay._id),
      stylistId: offDay.stylistId.toString(),
      type: offDay.type,
      startDate: offDay.startDate.toISOString(),
      endDate: offDay.endDate.toISOString(),
      reason: offDay.reason,
      status: offDay.status,
      approvedBy: offDay.approvedBy?.toString(),
      approvedAt: offDay.approvedAt?.toISOString(),
      adminRemarks: offDay.adminRemarks,
      createdAt: offDay.createdAt.toISOString(),
      updatedAt: offDay.updatedAt.toISOString(),
    };
  }
}
