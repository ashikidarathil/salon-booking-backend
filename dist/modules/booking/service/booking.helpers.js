"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStylistId = resolveStylistId;
exports.timeToMinutes = timeToMinutes;
exports.minutesToTime = minutesToTime;
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
async function resolveStylistId(userIdOrStylistId, slotRepo) {
    if ((0, mongoose_util_1.isValidObjectId)(userIdOrStylistId)) {
        const stylist = await slotRepo.findStylistById(userIdOrStylistId);
        if (stylist)
            return userIdOrStylistId;
    }
    const stylist = await slotRepo.findStylistByUserId(userIdOrStylistId);
    return stylist?._id.toString() ?? userIdOrStylistId;
}
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
