"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
const logger_1 = require("../../config/logger");
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const durationMs = Date.now() - start;
        logger_1.logger.http('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs,
            ip: req.ip,
            userId: req.auth?.userId ?? 'anonymous',
            userAgent: req.get('user-agent') ?? 'unknown',
        });
    });
    next();
};
exports.loggerMiddleware = loggerMiddleware;
