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
exports.SlotService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const slot_messages_1 = require("../constants/slot.messages");
const specialSlot_model_1 = require("../../../models/specialSlot.model");
const slot_mapper_1 = require("../mapper/slot.mapper");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let SlotService = class SlotService {
    constructor(slotRepo, slotValidator, availabilityService, specialSlotService) {
        this.slotRepo = slotRepo;
        this.slotValidator = slotValidator;
        this.availabilityService = availabilityService;
        this.specialSlotService = specialSlotService;
    }
    async blockSlot(slotId, reason) {
        // Dynamic slot IDs are generated on the fly and not in the DB.
        // Format: dynamic_{branchId}_{stylistId}_{date}_{startTime}_{endTime}
        if (slotId.startsWith('dynamic_')) {
            const parts = slotId.split('_');
            // parts[0] = 'dynamic', [1] = branchId, [2] = stylistId, [3] = date, [4] = startTime, [5] = endTime
            if (parts.length < 6) {
                throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const [, branchId, stylistId, date, startTime, endTime] = parts;
            // Check stylist exists
            const stylist = await this.slotRepo.findStylistById(stylistId);
            if (!stylist) {
                throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            // Create a blocked special slot record directly
            const created = await this.slotRepo.createSpecialSlot({
                branchId: (0, mongoose_util_1.toObjectId)(branchId),
                stylistId: stylist._id,
                date: new Date(date),
                startTime,
                endTime,
                status: specialSlot_model_1.SpecialSlotStatus.CANCELLED,
                note: reason,
            });
            return slot_mapper_1.SlotMapper.toResponse(created);
        }
        // Real/persisted slot — original flow
        if (!(0, mongoose_util_1.isValidObjectId)(slotId)) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const slot = await this.slotRepo.findSpecialSlotById(slotId);
        if (!slot) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (slot.status === specialSlot_model_1.SpecialSlotStatus.BOOKED) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.ALREADY_BOOKED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        await this.slotRepo.updateSpecialSlot(slotId, {
            status: specialSlot_model_1.SpecialSlotStatus.CANCELLED,
            note: reason,
        });
        const updated = await this.slotRepo.findSpecialSlotById(slotId);
        if (!updated) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return slot_mapper_1.SlotMapper.toResponse(updated);
    }
    async unblockSlot(slotId) {
        // Handle dynamic slot IDs — find and delete the matching CANCELLED special slot
        if (slotId.startsWith('dynamic_')) {
            const parts = slotId.split('_');
            if (parts.length < 6) {
                throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
            const [, branchId, stylistId, date, startTime, endTime] = parts;
            // Find the CANCELLED special slot created when this dynamic slot was blocked
            const allCancelled = await this.slotRepo.findSpecialSlots(branchId, [stylistId], new Date(date));
            const blocked = allCancelled.find((ss) => ss.status === specialSlot_model_1.SpecialSlotStatus.CANCELLED &&
                ss.startTime === startTime &&
                ss.endTime === endTime);
            if (!blocked) {
                throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
            }
            // Delete the CANCELLED special slot record — restores dynamic slot to AVAILABLE
            await this.slotRepo.updateSpecialSlot(blocked._id.toString(), {
                status: specialSlot_model_1.SpecialSlotStatus.AVAILABLE,
                note: undefined,
            });
            const updated = await this.slotRepo.findSpecialSlotById(blocked._id.toString());
            return slot_mapper_1.SlotMapper.toResponse((updated ?? blocked));
        }
        // Real/persisted slot — original flow
        if (!(0, mongoose_util_1.isValidObjectId)(slotId)) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const slot = await this.slotRepo.findSpecialSlotById(slotId);
        if (!slot) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (slot.status !== specialSlot_model_1.SpecialSlotStatus.CANCELLED) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_BLOCKED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        await this.slotRepo.updateSpecialSlot(slotId, { status: specialSlot_model_1.SpecialSlotStatus.AVAILABLE });
        const updated = await this.slotRepo.findSpecialSlotById(slotId);
        if (!updated) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return slot_mapper_1.SlotMapper.toResponse(updated);
    }
    async getDynamicAvailability(branchId, date, userIdOrStylistId, duration, includeAll = false, serviceId) {
        return this.availabilityService.getDynamicAvailability(branchId, date, userIdOrStylistId, duration, includeAll, serviceId);
    }
    async validateSlot(branchId, stylistId, date, startTime, duration) {
        return this.slotValidator.validateSlot(branchId, stylistId, date, startTime, duration);
    }
    async createSpecialSlot(dto) {
        return this.specialSlotService.createSpecialSlot(dto);
    }
    async listSpecialSlots(filter) {
        return this.specialSlotService.listSpecialSlots(filter);
    }
    async cancelSpecialSlot(id) {
        if (!(0, mongoose_util_1.isValidObjectId)(id)) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.specialSlotService.cancelSpecialSlot(id);
    }
};
exports.SlotService = SlotService;
exports.SlotService = SlotService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotValidator)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.AvailabilityService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.SpecialSlotService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SlotService);
