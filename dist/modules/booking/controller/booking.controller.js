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
exports.BookingController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const booking_messages_1 = require("../constants/booking.messages");
const appError_1 = require("../../../common/errors/appError");
let BookingController = class BookingController {
    constructor(bookingService) {
        this.bookingService = bookingService;
        this.create = async (req, res) => {
            const auth = this.extractAuth(req);
            const { items, notes } = req.body;
            const booking = await this.bookingService.createBooking(auth.userId, items, notes);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.cancel = async (req, res) => {
            const auth = this.extractAuth(req);
            const { id } = req.params;
            const { reason } = req.body;
            const booking = await this.bookingService.cancelBooking(id, auth.userId, reason, auth.role);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.CANCELLED);
        };
        this.getDetails = async (req, res) => {
            const { id } = req.params;
            const booking = await this.bookingService.getBookingDetails(id);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.FETCHED);
        };
        this.listMyBookings = async (req, res) => {
            const auth = this.extractAuth(req);
            const bookings = await this.bookingService.listUserBookings(auth.userId);
            return apiResponse_1.ApiResponse.success(res, bookings, booking_messages_1.BOOKING_MESSAGES.LISTED);
        };
        this.listAll = async (req, res) => {
            const { branchId, date } = req.query;
            const bookings = await this.bookingService.listAllBookings(branchId, date);
            return apiResponse_1.ApiResponse.success(res, bookings, booking_messages_1.BOOKING_MESSAGES.LISTED);
        };
        this.listStylistBookings = async (req, res) => {
            const auth = this.extractAuth(req);
            const query = req.query;
            const paginatedResult = await this.bookingService.listStylistBookings(auth.userId, query);
            return apiResponse_1.ApiResponse.success(res, paginatedResult, booking_messages_1.BOOKING_MESSAGES.LISTED);
        };
        this.reschedule = async (req, res) => {
            const auth = this.extractAuth(req);
            const { id } = req.params;
            const { items, reason } = req.body;
            const booking = await this.bookingService.rescheduleBooking(id, auth.userId, items, reason, auth.role);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.RESCHEDULED);
        };
        this.updateStatus = async (req, res) => {
            const auth = this.extractAuth(req);
            const { id } = req.params;
            const { status } = req.body;
            const booking = await this.bookingService.updateBookingStatus(id, auth.userId, status, auth.role);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.STATUS_UPDATED);
        };
        this.getTodayBookings = async (req, res) => {
            const { branchId } = req.query;
            const bookings = await this.bookingService.getTodayBookings(branchId);
            return apiResponse_1.ApiResponse.success(res, bookings, booking_messages_1.BOOKING_MESSAGES.LISTED);
        };
        this.getStylistTodayBookings = async (req, res) => {
            const auth = this.extractAuth(req);
            const bookings = await this.bookingService.getStylistTodayBookings(auth.userId);
            return apiResponse_1.ApiResponse.success(res, bookings, booking_messages_1.BOOKING_MESSAGES.LISTED);
        };
        this.getStylistStats = async (req, res) => {
            const auth = this.extractAuth(req);
            const { period, date } = req.query;
            const stats = await this.bookingService.getStylistStats(auth.userId, period, date);
            return apiResponse_1.ApiResponse.success(res, stats, booking_messages_1.BOOKING_MESSAGES.FETCHED);
        };
        this.applyCoupon = async (req, res) => {
            const auth = this.extractAuth(req);
            const { id } = req.params;
            const { code } = req.body;
            const booking = await this.bookingService.applyCoupon(id, code, auth.userId);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.FETCHED);
        };
        this.removeCoupon = async (req, res) => {
            const auth = this.extractAuth(req);
            const { id } = req.params;
            const booking = await this.bookingService.removeCoupon(id, auth.userId);
            return apiResponse_1.ApiResponse.success(res, booking, booking_messages_1.BOOKING_MESSAGES.FETCHED);
        };
    }
    extractAuth(req) {
        const auth = req.auth;
        if (!auth?.userId) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        return auth;
    }
};
exports.BookingController = BookingController;
exports.BookingController = BookingController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BookingService)),
    __metadata("design:paramtypes", [Object])
], BookingController);
