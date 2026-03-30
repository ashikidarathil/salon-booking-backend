"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistBranchMapper = void 0;
class StylistBranchMapper {
    static toBranchStylistItem(input) {
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
    static toUnassignedOption(input) {
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
exports.StylistBranchMapper = StylistBranchMapper;
