"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const httpStatus_enum_1 = require("../enums/httpStatus.enum");
const messages_1 = require("../constants/messages");
const roleMiddleware = (roles) => (req, res, next) => {
    if (!req.auth)
        return res.status(httpStatus_enum_1.HttpStatus.UNAUTHORIZED).json({ message: messages_1.MESSAGES.COMMON.UNAUTHORIZED });
    if (!roles.includes(req.auth.role))
        return res.status(httpStatus_enum_1.HttpStatus.FORBIDDEN).json({ message: messages_1.MESSAGES.COMMON.FORBIDDEN });
    next();
};
exports.roleMiddleware = roleMiddleware;
