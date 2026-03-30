"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const router = (0, express_1.Router)();
router.get('/user', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER]), (req, res) => {
    res.json({ message: 'User route accessed' });
});
router.get('/admin', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), (req, res) => {
    res.json({ message: 'Admin route accessed' });
});
exports.default = router;
