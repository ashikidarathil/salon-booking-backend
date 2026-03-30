"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const slot_routes_1 = require("../constants/slot.routes");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const slot_schema_1 = require("../dto/slot.schema");
const router = (0, express_1.Router)();
const controller = (0, index_1.resolveSlotController)();
// USER ROUTES
router.get(slot_routes_1.SLOT_ROUTES.USER.LIST, (0, validation_middleware_1.validate)({ query: slot_schema_1.GetAvailableSlotsQuerySchema }), controller.getAvailableSlots.bind(controller));
router.get(slot_routes_1.SLOT_ROUTES.USER.AVAILABILITY, controller.getDynamicAvailability.bind(controller));
router.use(['/slots/admin', '/slots/:slotId', '/slots/stylist', '/slots/special'], auth_middleware_1.authMiddleware);
// ADMIN ROUTES
router.get(slot_routes_1.SLOT_ROUTES.ADMIN.LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), controller.adminListSlots.bind(controller));
router.patch(slot_routes_1.SLOT_ROUTES.ADMIN.BLOCK, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.STYLIST]), (0, validation_middleware_1.validate)({ body: slot_schema_1.BlockSlotSchema }), controller.blockSlot.bind(controller));
router.patch(slot_routes_1.SLOT_ROUTES.ADMIN.UNBLOCK, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.STYLIST]), controller.unblockSlot.bind(controller));
router.get(slot_routes_1.SLOT_ROUTES.STYLIST.LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), controller.getStylistSlots.bind(controller));
router.post(slot_routes_1.SLOT_ROUTES.ADMIN.CREATE_SPECIAL, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST, userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ body: slot_schema_1.CreateSpecialSlotSchema }), controller.createSpecialSlot.bind(controller));
router.get(slot_routes_1.SLOT_ROUTES.ADMIN.LIST_SPECIAL, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.STYLIST]), (0, validation_middleware_1.validate)({ query: slot_schema_1.ListSpecialSlotsQuerySchema }), controller.listSpecialSlots.bind(controller));
router.delete(slot_routes_1.SLOT_ROUTES.ADMIN.CANCEL_SPECIAL, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN, userRole_enum_1.UserRole.STYLIST]), controller.cancelSpecialSlot.bind(controller));
exports.default = router;
