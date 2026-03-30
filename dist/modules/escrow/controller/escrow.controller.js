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
exports.EscrowController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const escrow_constants_1 = require("../constants/escrow.constants");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
let EscrowController = class EscrowController {
    constructor(escrowService) {
        this.escrowService = escrowService;
        this.getAllEscrows = async (req, res) => {
            const query = req.query;
            const escrows = await this.escrowService.getAllEscrows(query);
            return apiResponse_1.ApiResponse.success(res, escrows, escrow_constants_1.ESCROW_MESSAGES.FETCHED_ALL);
        };
        this.getEscrowByBooking = async (req, res) => {
            const { bookingId } = req.params;
            const escrow = await this.escrowService.getEscrowByBookingId(bookingId);
            return apiResponse_1.ApiResponse.success(res, escrow, escrow_constants_1.ESCROW_MESSAGES.FETCHED_ONE);
        };
        this.getStylistEscrows = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId) {
                throw new appError_1.AppError(escrow_constants_1.ESCROW_MESSAGES.ERROR.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const query = req.query;
            const escrows = await this.escrowService.getStylistEscrows(userId, query);
            return apiResponse_1.ApiResponse.success(res, escrows, escrow_constants_1.ESCROW_MESSAGES.FETCHED_ALL);
        };
        this.getHeldBalance = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId) {
                throw new appError_1.AppError(escrow_constants_1.ESCROW_MESSAGES.ERROR.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const balance = await this.escrowService.getHeldBalance(userId);
            return apiResponse_1.ApiResponse.success(res, balance, escrow_constants_1.ESCROW_MESSAGES.HELD_BALANCE);
        };
        this.getAdminStylistEscrows = async (req, res) => {
            const { stylistId } = req.params;
            const query = req.query;
            const escrows = await this.escrowService.getAdminStylistEscrows(stylistId, query);
            return apiResponse_1.ApiResponse.success(res, escrows, escrow_constants_1.ESCROW_MESSAGES.FETCHED_ALL);
        };
        this.getAdminStylistHeldBalance = async (req, res) => {
            const { stylistId } = req.params;
            const balance = await this.escrowService.getHeldBalance(stylistId);
            return apiResponse_1.ApiResponse.success(res, balance, escrow_constants_1.ESCROW_MESSAGES.HELD_BALANCE);
        };
    }
};
exports.EscrowController = EscrowController;
exports.EscrowController = EscrowController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.EscrowService)),
    __metadata("design:paramtypes", [Object])
], EscrowController);
