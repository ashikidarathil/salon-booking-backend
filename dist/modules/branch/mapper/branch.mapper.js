"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchMapper = void 0;
class BranchMapper {
    static toResponse(branch, distance) {
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
exports.BranchMapper = BranchMapper;
