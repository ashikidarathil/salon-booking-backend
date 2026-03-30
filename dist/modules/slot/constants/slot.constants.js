"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLOT_LABELS = exports.SLOT_PREFIXES = exports.SLOT_GRID_SIZE = exports.BOOKING_WINDOW_DAYS = exports.SlotStatus = void 0;
var SlotStatus;
(function (SlotStatus) {
    SlotStatus["AVAILABLE"] = "AVAILABLE";
    SlotStatus["BOOKED"] = "BOOKED";
    SlotStatus["BLOCKED"] = "BLOCKED";
    SlotStatus["BREAK"] = "BREAK";
    SlotStatus["OFF_DAY"] = "OFF_DAY";
    SlotStatus["NON_WORKING"] = "NON_WORKING";
    SlotStatus["NO_SCHEDULE"] = "NO_SCHEDULE";
    SlotStatus["HOLIDAY"] = "HOLIDAY";
    SlotStatus["SPECIAL"] = "SPECIAL";
})(SlotStatus || (exports.SlotStatus = SlotStatus = {}));
exports.BOOKING_WINDOW_DAYS = 14;
exports.SLOT_GRID_SIZE = 15;
exports.SLOT_PREFIXES = {
    DYNAMIC: 'dynamic_',
    SPECIAL: 'special_',
    HOLIDAY: 'holiday_',
};
exports.SLOT_LABELS = {
    SYSTEM: 'SYSTEM',
    UNKNOWN: 'Unknown',
    LUNCH_BREAK: 'Lunch Break',
    TEA_BREAK: 'Tea Break',
    GENERIC_BREAK: 'Break',
    BLOCKED_NOTE: 'Blocked',
    HOLIDAY_PREFIX: 'HOLIDAY: ',
};
