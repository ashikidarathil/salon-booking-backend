"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockMiddleware = void 0;
const cookie_util_1 = require("../utils/cookie.util");
const httpStatus_enum_1 = require("../enums/httpStatus.enum");
const messages_1 = require("../constants/messages");
const blockMiddleware = (req, res, next) => {
    if (req.authUser?.isBlocked) {
        (0, cookie_util_1.clearAuthCookies)(res);
        return res.status(httpStatus_enum_1.HttpStatus.FORBIDDEN).json({
            message: messages_1.MESSAGES.COMMON.YOUR_ACC_IS_BLOCKED,
        });
    }
    next();
};
exports.blockMiddleware = blockMiddleware;
