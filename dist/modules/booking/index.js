"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBookingController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const booking_repository_1 = require("./repository/booking.repository");
const booking_service_1 = require("./service/booking.service");
const BookingValidator_1 = require("./service/BookingValidator");
const BookingQueryService_1 = require("./service/BookingQueryService");
const booking_controller_1 = require("./controller/booking.controller");
tsyringe_1.container.register(tokens_1.TOKENS.BookingRepository, {
    useClass: booking_repository_1.BookingRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.BookingValidator, {
    useClass: BookingValidator_1.BookingValidator,
});
tsyringe_1.container.register(tokens_1.TOKENS.BookingQueryService, {
    useClass: BookingQueryService_1.BookingQueryService,
});
tsyringe_1.container.register(tokens_1.TOKENS.BookingService, {
    useClass: booking_service_1.BookingService,
});
tsyringe_1.container.register(booking_controller_1.BookingController, {
    useClass: booking_controller_1.BookingController,
});
const resolveBookingController = () => tsyringe_1.container.resolve(booking_controller_1.BookingController);
exports.resolveBookingController = resolveBookingController;
