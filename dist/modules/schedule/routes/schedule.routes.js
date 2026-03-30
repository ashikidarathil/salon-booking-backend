"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("..");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const schedule_constants_1 = require("../constants/schedule.constants");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const schedule_schema_1 = require("../dto/schedule.schema");
const router = (0, express_1.Router)();
const controller = (0, __1.resolveScheduleController)();
router.use(auth_middleware_1.authMiddleware);
// STYLIST & ADMIN ROUTES
router.patch(schedule_constants_1.SCHEDULE_ROUTES.WEEKLY_DETAIL, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: schedule_schema_1.WeeklyScheduleRequestSchema }), controller.updateWeekly.bind(controller));
router.get(schedule_constants_1.SCHEDULE_ROUTES.BY_STYLIST + schedule_constants_1.SCHEDULE_ROUTES.WEEKLY, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.USER]), controller.getWeekly.bind(controller));
router.post(schedule_constants_1.SCHEDULE_ROUTES.DAILY, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: schedule_schema_1.DailyOverrideRequestSchema }), controller.createDailyOverride.bind(controller));
router.delete(schedule_constants_1.SCHEDULE_ROUTES.DAILY + schedule_constants_1.SCHEDULE_ROUTES.BY_ID, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.deleteDailyOverride.bind(controller));
router.get(schedule_constants_1.SCHEDULE_ROUTES.BY_STYLIST + schedule_constants_1.SCHEDULE_ROUTES.DAILY, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.USER]), controller.getDailyOverrides.bind(controller));
// BREAKS
router.post(schedule_constants_1.SCHEDULE_ROUTES.BREAKS, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: schedule_schema_1.StylistBreakRequestSchema }), controller.addBreak.bind(controller));
router.delete(schedule_constants_1.SCHEDULE_ROUTES.BREAKS_BY_ID, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.deleteBreak.bind(controller));
router.get(schedule_constants_1.SCHEDULE_ROUTES.BY_STYLIST + schedule_constants_1.SCHEDULE_ROUTES.BREAKS, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.USER]), controller.getBreaks.bind(controller));
exports.default = router;
