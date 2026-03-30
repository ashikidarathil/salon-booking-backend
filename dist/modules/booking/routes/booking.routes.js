"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const booking_routes_1 = require("../constants/booking.routes");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const booking_schema_1 = require("../dto/booking.schema");
const router = (0, express_1.Router)();
const controller = (0, index_1.resolveBookingController)();
router.use(['/bookings', '/admin', '/stylist'], auth_middleware_1.authMiddleware);
// ─── User Routes ───────────────────────────────────────────────────────────
router.post(booking_routes_1.BOOKING_ROUTES.USER.BASE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: booking_schema_1.CreateBookingSchema }), controller.create.bind(controller));
router.get(booking_routes_1.BOOKING_ROUTES.USER.MY_BOOKINGS, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ query: booking_schema_1.BookingPaginationSchema }), controller.listMyBookings.bind(controller));
router.get(booking_routes_1.BOOKING_ROUTES.USER.BY_ID(':id'), (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.getDetails.bind(controller));
router.patch(booking_routes_1.BOOKING_ROUTES.USER.CANCEL(':id'), (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: booking_schema_1.CancelBookingSchema }), controller.cancel.bind(controller));
router.patch(booking_routes_1.BOOKING_ROUTES.USER.RESCHEDULE(':id'), (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: booking_schema_1.RescheduleBookingSchema }), controller.reschedule.bind(controller));
router.patch(booking_routes_1.BOOKING_ROUTES.USER.STATUS(':id'), (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: booking_schema_1.UpdateBookingStatusSchema }), controller.updateStatus.bind(controller));
router.post(booking_routes_1.BOOKING_ROUTES.USER.APPLY_COUPON(':id'), (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.applyCoupon.bind(controller));
router.post(booking_routes_1.BOOKING_ROUTES.USER.REMOVE_COUPON(':id'), (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.removeCoupon.bind(controller));
// ─── Stylist Routes ────────────────────────────────────────────────────────
router.get(booking_routes_1.BOOKING_ROUTES.STYLIST.LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ query: booking_schema_1.BookingPaginationSchema }), controller.listStylistBookings.bind(controller));
router.get(booking_routes_1.BOOKING_ROUTES.STYLIST.TODAY, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.getStylistTodayBookings.bind(controller));
router.get(booking_routes_1.BOOKING_ROUTES.STYLIST.STATS, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ query: booking_schema_1.BookingStatsSchema }), controller.getStylistStats.bind(controller));
// ─── Admin Routes ──────────────────────────────────────────────────────────
router.get(booking_routes_1.BOOKING_ROUTES.ADMIN.LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ query: booking_schema_1.BookingPaginationSchema }), controller.listAll.bind(controller));
router.get(booking_routes_1.BOOKING_ROUTES.ADMIN.TODAY, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), controller.getTodayBookings.bind(controller));
exports.default = router;
