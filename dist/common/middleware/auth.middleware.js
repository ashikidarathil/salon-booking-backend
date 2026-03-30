"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const httpStatus_enum_1 = require("../enums/httpStatus.enum");
const messages_1 = require("../constants/messages");
const authMiddleware = (req, res, next) => {
    const roleHeader = req.headers['x-auth-role']?.toUpperCase();
    if (!roleHeader) {
        return res.status(httpStatus_enum_1.HttpStatus.UNAUTHORIZED).json({ message: 'Auth role header missing' });
    }
    const rolePrefix = roleHeader.toLowerCase();
    const accessToken = req.cookies?.[`${rolePrefix}_access_token`];
    if (!accessToken) {
        return res.status(httpStatus_enum_1.HttpStatus.UNAUTHORIZED).json({ message: messages_1.MESSAGES.AUTH.NO_TOKEN });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, env_1.env.ACCESS_TOKEN_SECRET);
        if (decoded.role !== roleHeader) {
            console.error(`Role mismatch: Token(${decoded.role}) vs Header(${roleHeader})`);
            return res.status(httpStatus_enum_1.HttpStatus.FORBIDDEN).json({ message: 'Role mismatch' });
        }
        req.auth = decoded;
        next();
    }
    catch {
        return res.status(httpStatus_enum_1.HttpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
};
exports.authMiddleware = authMiddleware;
