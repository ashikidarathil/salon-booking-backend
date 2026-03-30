"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotMapper = void 0;
const slot_constants_1 = require("../constants/slot.constants");
const specialSlot_model_1 = require("../../../models/specialSlot.model");
const slot_helpers_1 = require("../service/slot.helpers");
class SlotMapper {
    static toResponse(slot) {
        const stylist = slot.stylistId;
        const date = slot.date instanceof Date ? slot.date : new Date(slot.date);
        const startTimeUTC = slot.startTimeUTC
            ? slot.startTimeUTC instanceof Date
                ? slot.startTimeUTC
                : new Date(slot.startTimeUTC)
            : new Date(date.getTime() + (0, slot_helpers_1.timeToMinutes)(slot.startTime) * 60000);
        return {
            id: slot._id.toString(),
            branchId: slot.branchId.toString(),
            stylistId: (stylist?._id || slot.stylistId || '').toString(),
            stylistName: stylist?.userId?.name || slot_constants_1.SLOT_LABELS.UNKNOWN,
            stylistEmail: stylist?.userId?.email,
            date: date.toISOString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            startTimeUTC: startTimeUTC.toISOString(),
            status: this.mapStatus(slot.status),
            lockedBy: slot.lockedBy ? slot.lockedBy.toString() : null,
            lockedUntil: slot.lockedUntil
                ? slot.lockedUntil instanceof Date
                    ? slot.lockedUntil.toISOString()
                    : slot.lockedUntil
                : null,
            note: slot.note,
            price: slot.price,
            createdAt: slot.createdAt.toISOString(),
            updatedAt: slot.updatedAt.toISOString(),
        };
    }
    static mapStatus(status) {
        if (Object.values(slot_constants_1.SlotStatus).includes(status)) {
            return status;
        }
        switch (status) {
            case specialSlot_model_1.SpecialSlotStatus.AVAILABLE:
                return slot_constants_1.SlotStatus.SPECIAL;
            case specialSlot_model_1.SpecialSlotStatus.BOOKED:
                return slot_constants_1.SlotStatus.BOOKED;
            case specialSlot_model_1.SpecialSlotStatus.CANCELLED:
                return slot_constants_1.SlotStatus.BLOCKED;
            default:
                return slot_constants_1.SlotStatus.SPECIAL;
        }
    }
}
exports.SlotMapper = SlotMapper;
