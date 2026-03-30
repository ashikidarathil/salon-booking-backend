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
exports.SlotController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const slot_messages_1 = require("../constants/slot.messages");
let SlotController = class SlotController {
    constructor(slotService) {
        this.slotService = slotService;
        // ─── Handlers ──────────────────────────────────────────────────────────────
        this.getAvailableSlots = async (req, res) => {
            const { branchId, date, stylistId, serviceId, duration: queryDuration, } = req.query;
            const slots = await this.slotService.getDynamicAvailability(branchId, new Date(date), stylistId, queryDuration ? Number(queryDuration) : undefined, false, serviceId);
            return apiResponse_1.ApiResponse.success(res, slots, slot_messages_1.SLOT_MESSAGES.FETCHED);
        };
        this.adminListSlots = async (req, res) => {
            const { branchId, date, stylistId } = req.query;
            const slots = await this.slotService.getDynamicAvailability(branchId, new Date(date), stylistId, undefined, true);
            return apiResponse_1.ApiResponse.success(res, slots, slot_messages_1.SLOT_MESSAGES.FETCHED);
        };
        this.getStylistSlots = async (req, res) => {
            const auth = this.extractAuth(req, res);
            if (!auth)
                return res; // We have already sent an error response
            const { branchId, date, stylistId: queryStylistId, } = req.query;
            const stylistId = queryStylistId || auth.userId;
            const slots = await this.slotService.getDynamicAvailability(branchId, new Date(date), stylistId, undefined, true);
            return apiResponse_1.ApiResponse.success(res, slots, slot_messages_1.SLOT_MESSAGES.FETCHED);
        };
        this.blockSlot = async (req, res) => {
            const { slotId } = req.params;
            const { reason } = req.body;
            const slot = await this.slotService.blockSlot(slotId, reason);
            return apiResponse_1.ApiResponse.success(res, slot, slot_messages_1.SLOT_MESSAGES.BLOCKED);
        };
        this.unblockSlot = async (req, res) => {
            const { slotId } = req.params;
            const slot = await this.slotService.unblockSlot(slotId);
            return apiResponse_1.ApiResponse.success(res, slot, slot_messages_1.SLOT_MESSAGES.UNBLOCKED);
        };
        this.getDynamicAvailability = async (req, res) => {
            return this.getAvailableSlots(req, res);
        };
        this.createSpecialSlot = async (req, res) => {
            const auth = this.extractAuth(req, res);
            if (!auth)
                return res;
            const { stylistId, branchId, date, startTime, endTime, note, serviceId } = req.body;
            const slot = await this.slotService.createSpecialSlot({
                stylistId: stylistId || auth.userId,
                branchId,
                date,
                startTime,
                endTime,
                note,
                serviceId,
                createdBy: auth.userId,
            });
            return apiResponse_1.ApiResponse.success(res, slot, slot_messages_1.SLOT_MESSAGES.SPECIAL_CREATED, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.listSpecialSlots = async (req, res) => {
            const { branchId, stylistId, date, status } = req.query;
            const slots = await this.slotService.listSpecialSlots({ branchId, stylistId, date, status });
            return apiResponse_1.ApiResponse.success(res, slots, slot_messages_1.SLOT_MESSAGES.FETCHED);
        };
        this.cancelSpecialSlot = async (req, res) => {
            const { id } = req.params;
            const slot = await this.slotService.cancelSpecialSlot(id);
            return apiResponse_1.ApiResponse.success(res, slot, slot_messages_1.SLOT_MESSAGES.SPECIAL_CANCELLED);
        };
    }
    extractAuth(req, res) {
        const auth = req.auth;
        if (!auth?.userId) {
            apiResponse_1.ApiResponse.error(res, slot_messages_1.SLOT_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            return null;
        }
        return auth;
    }
};
exports.SlotController = SlotController;
exports.SlotController = SlotController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotService)),
    __metadata("design:paramtypes", [Object])
], SlotController);
