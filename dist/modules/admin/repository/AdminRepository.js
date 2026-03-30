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
exports.AdminRepository = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const booking_model_1 = require("../../../models/booking.model");
const escrow_model_1 = require("../../../models/escrow.model");
let AdminRepository = class AdminRepository {
    constructor(bookingRepo, userRepo, escrowRepo) {
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.escrowRepo = escrowRepo;
    }
    async getStats(_query) {
        const [allBookings, allUsers, escrowItems] = await Promise.all([
            this.bookingRepo.find({
                status: {
                    $in: [
                        booking_model_1.BookingStatus.COMPLETED,
                        booking_model_1.BookingStatus.CONFIRMED,
                        booking_model_1.BookingStatus.CANCELLED,
                        booking_model_1.BookingStatus.PENDING_PAYMENT,
                    ],
                },
            }, []),
            this.userRepo.findAll({}),
            this.escrowRepo.find({ status: escrow_model_1.EscrowStatus.HELD }),
        ]);
        return {
            allBookings,
            allUsers,
            escrowItems,
        };
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.EscrowRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AdminRepository);
