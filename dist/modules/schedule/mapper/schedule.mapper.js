"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleMapper = void 0;
class ScheduleMapper {
    static toWeeklyResponse(schedule) {
        return {
            id: schedule._id.toString(),
            stylistId: schedule.stylistId.toString(),
            branchId: schedule.branchId.toString(),
            dayOfWeek: schedule.dayOfWeek,
            isWorkingDay: schedule.isWorkingDay,
            shifts: schedule.shifts.map((shift) => ({
                startTime: shift.startTime,
                endTime: shift.endTime,
            })),
            createdAt: schedule.createdAt.toISOString(),
            updatedAt: schedule.updatedAt.toISOString(),
        };
    }
    static toDailyResponse(override) {
        return {
            id: override._id.toString(),
            stylistId: override.stylistId.toString(),
            branchId: override.branchId.toString(),
            date: override.date.toISOString(),
            isWorkingDay: override.isWorkingDay,
            shifts: override.shifts.map((shift) => ({
                startTime: shift.startTime,
                endTime: shift.endTime,
            })),
            reason: override.reason,
            createdAt: override.createdAt.toISOString(),
            updatedAt: override.updatedAt.toISOString(),
        };
    }
    static toBreakResponse(b) {
        return {
            id: b._id.toString(),
            stylistId: b.stylistId.toString(),
            branchId: b.branchId.toString(),
            dayOfWeek: b.dayOfWeek,
            date: b.date?.toISOString(),
            startTime: b.startTime,
            endTime: b.endTime,
            description: b.description,
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
        };
    }
}
exports.ScheduleMapper = ScheduleMapper;
