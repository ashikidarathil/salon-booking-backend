"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./env");
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    http: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    http: 'magenta',
};
winston_1.default.addColors(colors);
/* ===================== FORMATS ===================== */
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }), winston_1.default.format.printf((info) => {
    let out = `[${info.timestamp}] [${info.level}] ${info.message}`;
    const meta = info.metadata;
    if (meta && Object.keys(meta).length > 0) {
        out += ` ${JSON.stringify(meta)}`;
    }
    return out;
}));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
/* ===================== TRANSPORTS ===================== */
const transports = [
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'combined', '%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
    }),
    new winston_daily_rotate_file_1.default({
        level: 'error',
        filename: path_1.default.join('logs', 'errors', '%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
    }),
    new winston_daily_rotate_file_1.default({
        level: 'http',
        filename: path_1.default.join('logs', 'http', '%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        format: fileFormat,
    }),
];
/* ===================== LOGGER ===================== */
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    transports,
    exceptionHandlers: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'exceptions', '%DATE%.log'),
        }),
    ],
    rejectionHandlers: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'rejections', '%DATE%.log'),
        }),
    ],
});
