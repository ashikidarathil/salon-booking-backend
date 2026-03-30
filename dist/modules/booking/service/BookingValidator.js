"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidator = void 0;
const tsyringe_1 = require("tsyringe");
const booking_model_1 = require("../../../models/booking.model");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const booking_messages_1 = require("../constants/booking.messages");
const booking_constants_1 = require("../constants/booking.constants");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
let BookingValidator = class BookingValidator {
    validateStatusTransition(booking, newStatus, role) {
        const currentStatus = booking.status;
        if (currentStatus === booking_model_1.BookingStatus.CANCELLED) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.MODIFIED_CANCELLED, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
        if (role === userRole_enum_1.UserRole.USER && newStatus !== booking_model_1.BookingStatus.CANCELLED) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.STATUS_FORBIDDEN, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (role === userRole_enum_1.UserRole.STYLIST) {
            const allowedStylistStatuses = [
                booking_model_1.BookingStatus.NO_SHOW,
                booking_model_1.BookingStatus.COMPLETED,
                booking_model_1.BookingStatus.CANCELLED,
            ];
            if (!allowedStylistStatuses.includes(newStatus)) {
                throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.STATUS_FORBIDDEN_STYLIST, httpStatus_enum_1.HttpStatus.FORBIDDEN);
            }
        }
    }
    validateLeadTime(startTime, date) {
        const bookingDate = new Date(date);
        const [hours, minutes] = startTime.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
        const leadTimeMs = bookingDate.getTime() - Date.now();
        const leadTimeHours = leadTimeMs / booking_constants_1.TIME_UTILS.MS_PER_HOUR;
        if (leadTimeHours < booking_constants_1.BOOKING_POLICY.MIN_LEAD_TIME_HOURS) {
            throw new appError_1.AppError(booking_messages_1.BOOKING_MESSAGES.LEAD_TIME_VIOLATION, httpStatus_enum_1.HttpStatus.CONFLICT);
        }
    }
    isAuthorizedToModify(booking, userId, role, stylistId) {
        if (role === userRole_enum_1.UserRole.ADMIN)
            return true;
        if (this.getRefId(booking.userId) === userId)
            return true;
        if (role === userRole_enum_1.UserRole.STYLIST && stylistId) {
            return this.getRefId(booking.stylistId) === stylistId;
        }
        return false;
    }
    getRefId(ref) {
        if (ref && typeof ref === 'object' && '_id' in ref) {
            return ref._id.toString();
        }
        return ref;
    }
};
exports.BookingValidator = BookingValidator;
exports.BookingValidator = BookingValidator = __decorate([
    (0, tsyringe_1.injectable)()
], BookingValidator);
