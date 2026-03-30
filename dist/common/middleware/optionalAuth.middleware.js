"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const optionalAuthMiddleware = (req, res, next) => {
    const roleHeader = req.headers['x-auth-role']?.toUpperCase();
    const currentTabId = req.headers['x-tab-id'];
    if (!roleHeader) {
        return next();
    }
    const rolePrefix = roleHeader.toLowerCase();
    const accessToken = req.cookies?.[`${rolePrefix}_access_token`];
    if (!accessToken) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, env_1.env.ACCESS_TOKEN_SECRET);
        if (decoded.tabId && currentTabId && decoded.tabId !== currentTabId) {
            // For optional auth, we just ignore invalid tab ID
            return next();
        }
        if (decoded.role === roleHeader) {
            req.auth = decoded;
        }
        next();
    }
    catch {
        // If token is invalid or expired, just proceed without req.auth
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
