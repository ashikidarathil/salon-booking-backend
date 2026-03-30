"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffDayMapper = void 0;
class OffDayMapper {
    static toResponse(offDay) {
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
exports.OffDayMapper = OffDayMapper;
