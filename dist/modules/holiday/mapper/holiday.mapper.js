"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayMapper = void 0;
class HolidayMapper {
    static toResponse(holiday) {
        return {
            id: String(holiday._id),
            branchIds: (holiday.branchIds || []).map((id) => id.toString()),
            date: holiday.date.toISOString(),
            name: holiday.name,
            isAllBranches: holiday.isAllBranches,
            createdAt: holiday.createdAt.toISOString(),
            updatedAt: holiday.updatedAt.toISOString(),
        };
    }
}
exports.HolidayMapper = HolidayMapper;
