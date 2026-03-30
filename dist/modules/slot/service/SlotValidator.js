"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotValidator = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const specialSlot_model_1 = require("../../../models/specialSlot.model");
const slot_helpers_1 = require("./slot.helpers");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let SlotValidator = class SlotValidator {
    constructor(slotRepo, bookingRepo) {
        this.slotRepo = slotRepo;
        this.bookingRepo = bookingRepo;
    }
    timeToMinutes(time) {
        return (0, slot_helpers_1.timeToMinutes)(time);
    }
    minutesToTime(minutes) {
        return (0, slot_helpers_1.minutesToTime)(minutes);
    }
    async validateSlot(branchId, stylistId, date, startTime, duration) {
        const startMin = this.timeToMinutes(startTime);
        const endMin = startMin + duration;
        const hasBookingOverlap = await this.checkBookingOverlap(stylistId, date, startMin, endMin);
        if (hasBookingOverlap)
            return false;
        const hasSpecialOverlap = await this.checkSpecialSlotOverlap(branchId, stylistId, date, startMin, endMin);
        if (hasSpecialOverlap)
            return false;
        return true;
    }
    async checkSpecialSlotOverlap(branchId, stylistId, date, newStartMin, newEndMin, excludeId) {
        const query = {
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            date,
            status: specialSlot_model_1.SpecialSlotStatus.AVAILABLE,
        };
        if (excludeId) {
            query._id = { $ne: (0, mongoose_util_1.toObjectId)(excludeId) };
        }
        const specialSlots = await this.slotRepo.findSpecialSlotsWithStylist(query);
        for (const slot of specialSlots) {
            const existingStartMin = this.timeToMinutes(slot.startTime);
            const existingEndMin = this.timeToMinutes(slot.endTime);
            if (newStartMin < existingEndMin && newEndMin > existingStartMin) {
                return true;
            }
        }
        return false;
    }
    async checkBookingOverlap(stylistId, date, newStartMin, newEndMin) {
        const existingBookings = await this.bookingRepo.find({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            date,
            status: { $nin: ['CANCELLED', 'RESCHEDULED', 'BLOCKED'] },
        });
        for (const b of existingBookings) {
            for (const item of b.items) {
                if (item.stylistId.toString() !== stylistId)
                    continue;
                const bStartMin = this.timeToMinutes(item.startTime);
                const bEndMin = this.timeToMinutes(item.endTime);
                if (newStartMin < bEndMin && newEndMin > bStartMin) {
                    return true;
                }
            }
        }
        return false;
    }
};
exports.SlotValidator = SlotValidator;
exports.SlotValidator = SlotValidator = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __metadata("design:paramtypes", [Object, Object])
], SlotValidator);
