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
exports.SpecialSlotService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const specialSlot_model_1 = require("../../../models/specialSlot.model");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const slot_messages_1 = require("../constants/slot.messages");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const slot_mapper_1 = require("../mapper/slot.mapper");
const slot_helpers_1 = require("./slot.helpers");
let SpecialSlotService = class SpecialSlotService {
    constructor(slotRepo, slotValidator) {
        this.slotRepo = slotRepo;
        this.slotValidator = slotValidator;
    }
    async createSpecialSlot(dto) {
        const stylistId = await (0, slot_helpers_1.resolveStylistId)(dto.stylistId, this.slotRepo);
        const date = new Date(dto.date);
        date.setUTCHours(0, 0, 0, 0);
        const startMin = (0, slot_helpers_1.timeToMinutes)(dto.startTime);
        const endMin = (0, slot_helpers_1.timeToMinutes)(dto.endTime);
        if (startMin >= endMin) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.INVALID_TIME_RANGE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (date < today) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.PAST_DATE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const hasBookingOverlap = await this.slotValidator.checkBookingOverlap(stylistId, date, startMin, endMin);
        if (hasBookingOverlap) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.UNAVAILABLE, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
        const hasSpecialOverlap = await this.slotValidator.checkSpecialSlotOverlap(dto.branchId, stylistId, date, startMin, endMin);
        if (hasSpecialOverlap) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.SPECIAL_OVERLAP, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
        let price = 0;
        if (dto.serviceId) {
            const branchService = await this.slotRepo.findBranchService(dto.branchId, dto.serviceId);
            if (branchService) {
                price = branchService.price;
            }
        }
        const specialSlot = await this.slotRepo.createSpecialSlot({
            ...dto,
            branchId: (0, mongoose_util_1.toObjectId)(dto.branchId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            date,
            status: specialSlot_model_1.SpecialSlotStatus.AVAILABLE,
            price,
            createdBy: dto.createdBy ? (0, mongoose_util_1.toObjectId)(dto.createdBy) : undefined,
            serviceId: dto.serviceId ? (0, mongoose_util_1.toObjectId)(dto.serviceId) : undefined,
        });
        const populated = await this.slotRepo.findSpecialSlotById(specialSlot._id.toString());
        if (!populated) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return slot_mapper_1.SlotMapper.toResponse(populated);
    }
    async listSpecialSlots(filter) {
        const query = {};
        if (filter.branchId)
            query.branchId = (0, mongoose_util_1.toObjectId)(filter.branchId);
        if (filter.stylistId)
            query.stylistId = (0, mongoose_util_1.toObjectId)(await (0, slot_helpers_1.resolveStylistId)(filter.stylistId, this.slotRepo));
        if (filter.date) {
            const d = new Date(filter.date);
            d.setUTCHours(0, 0, 0, 0);
            query.date = d;
        }
        if (filter.status) {
            query.status = filter.status;
        }
        else {
            // Exclude CANCELLED (system-created blocked slots) — they show in the normal slot grid
            query.status = { $ne: specialSlot_model_1.SpecialSlotStatus.CANCELLED };
        }
        const slots = await this.slotRepo.findSpecialSlotsWithStylist(query);
        return slots.map((s) => slot_mapper_1.SlotMapper.toResponse(s));
    }
    async cancelSpecialSlot(id) {
        const slot = await this.slotRepo.findSpecialSlotById(id);
        if (!slot) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (slot.status === specialSlot_model_1.SpecialSlotStatus.CANCELLED) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.SPECIAL_CANCELLED, httpStatus_enum_1.HttpStatus.OK);
        }
        await this.slotRepo.updateSpecialSlot(id, { status: specialSlot_model_1.SpecialSlotStatus.CANCELLED });
        const updated = await this.slotRepo.findSpecialSlotById(id);
        if (!updated) {
            throw new appError_1.AppError(slot_messages_1.SLOT_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return slot_mapper_1.SlotMapper.toResponse(updated);
    }
};
exports.SpecialSlotService = SpecialSlotService;
exports.SpecialSlotService = SpecialSlotService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotValidator)),
    __metadata("design:paramtypes", [Object, Object])
], SpecialSlotService);
