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
exports.EscrowService = void 0;
const tsyringe_1 = require("tsyringe");
const escrow_constants_1 = require("../constants/escrow.constants");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const tokens_1 = require("../../../common/di/tokens");
const escrow_mapper_1 = require("../mapper/escrow.mapper");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const booking_helpers_1 = require("../../booking/service/booking.helpers");
let EscrowService = class EscrowService {
    constructor(escrowRepository, stylistWalletService, slotRepo) {
        this.escrowRepository = escrowRepository;
        this.stylistWalletService = stylistWalletService;
        this.slotRepo = slotRepo;
    }
    async holdAmount(bookingId, stylistId, amount) {
        const existing = await this.escrowRepository.findByBookingId(bookingId);
        if (existing) {
            throw new appError_1.AppError(escrow_constants_1.ESCROW_MESSAGES.ERROR.ALREADY_EXISTS, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
        return this.escrowRepository.create({
            bookingId: (0, mongoose_util_1.toObjectId)(bookingId),
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            amount,
            status: escrow_constants_1.EscrowStatus.HELD,
            releaseDate: (0, escrow_constants_1.getCurrentDateString)(),
        });
    }
    async getEscrowByBookingId(bookingId) {
        if (!(0, mongoose_util_1.isValidObjectId)(bookingId)) {
            throw new appError_1.AppError(escrow_constants_1.ESCROW_MESSAGES.ERROR.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const escrow = await this.escrowRepository.findByBookingId(bookingId);
        if (!escrow) {
            throw new appError_1.AppError(escrow_constants_1.ESCROW_MESSAGES.ERROR.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return escrow_mapper_1.EscrowMapper.toResponseDto(escrow);
    }
    async getAllEscrows(query) {
        const result = await this.escrowRepository.findPaginated(query);
        return {
            data: escrow_mapper_1.EscrowMapper.toResponseListDto(result.data),
            pagination: result.pagination,
        };
    }
    async getStylistEscrows(userId, query) {
        const stylistId = await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo);
        const result = await this.escrowRepository.findPaginated({
            ...query,
            stylistId,
        });
        return {
            data: escrow_mapper_1.EscrowMapper.toResponseListDto(result.data),
            pagination: result.pagination,
        };
    }
    async getHeldBalance(userId) {
        const stylistId = await (0, booking_helpers_1.resolveStylistId)(userId, this.slotRepo);
        const escrows = await this.escrowRepository.find({
            stylistId: (0, mongoose_util_1.toObjectId)(stylistId),
            status: escrow_constants_1.EscrowStatus.HELD,
        });
        return escrows.reduce((sum, e) => sum + e.amount, 0);
    }
    async getAdminStylistEscrows(stylistId, query) {
        const result = await this.escrowRepository.findPaginated({
            ...query,
            stylistId,
        });
        return {
            data: escrow_mapper_1.EscrowMapper.toResponseListDto(result.data),
            pagination: result.pagination,
        };
    }
    async releaseDailyEscrow() {
        const currentDate = (0, escrow_constants_1.getCurrentDateString)();
        const due = await this.escrowRepository.findHeldBeforeDate(currentDate);
        await Promise.allSettled(due.map(async (escrow) => {
            const stylistDoc = escrow.stylistId;
            const userIdStr = (0, mongoose_util_1.getIdString)(stylistDoc.userId);
            await this.stylistWalletService.addEarnings(userIdStr, escrow.amount);
            await this.escrowRepository.updateStatus((0, mongoose_util_1.getIdString)(escrow._id), escrow_constants_1.EscrowStatus.RELEASED);
        }));
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.EscrowRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistWalletService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], EscrowService);
