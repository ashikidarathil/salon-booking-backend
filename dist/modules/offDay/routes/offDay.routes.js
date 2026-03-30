"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("..");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const offDay_constants_1 = require("../constants/offDay.constants");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const offDay_schema_1 = require("../dto/offDay.schema");
const router = (0, express_1.Router)();
const controller = (0, __1.resolveOffDayController)();
router.use('/off-days', auth_middleware_1.authMiddleware);
// STYLIST ROUTES
router.post(offDay_constants_1.OFF_DAY_ROUTES.BASE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST]), (0, validation_middleware_1.validate)({ body: offDay_schema_1.OffDayRequestSchema }), controller.requestOffDay.bind(controller));
router.get(offDay_constants_1.OFF_DAY_ROUTES.BASE + offDay_constants_1.OFF_DAY_ROUTES.MY, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST]), controller.getMyOffDays.bind(controller));
// ADMIN & SHARED ROUTES
router.get(offDay_constants_1.OFF_DAY_ROUTES.BASE + offDay_constants_1.OFF_DAY_ROUTES.BY_STYLIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.USER]), controller.getStylistOffDays.bind(controller));
router.get(offDay_constants_1.OFF_DAY_ROUTES.BASE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), controller.getAllOffDays.bind(controller));
router.patch(offDay_constants_1.OFF_DAY_ROUTES.BASE + offDay_constants_1.OFF_DAY_ROUTES.BY_ID + offDay_constants_1.OFF_DAY_ROUTES.STATUS, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: offDay_schema_1.OffDayActionSchema }), controller.updateStatus.bind(controller));
router.delete(offDay_constants_1.OFF_DAY_ROUTES.BASE + offDay_constants_1.OFF_DAY_ROUTES.BY_ID, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.STYLIST]), controller.deleteOffDay.bind(controller));
exports.default = router;
