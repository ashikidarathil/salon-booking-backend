"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatUploadMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const httpStatus_enum_1 = require("../enums/httpStatus.enum");
const appError_1 = require("../errors/appError");
const storage = multer_1.default.memoryStorage();
const imageFileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new appError_1.AppError('Only image files are allowed', httpStatus_enum_1.HttpStatus.BAD_REQUEST));
    }
    cb(null, true);
};
const chatMediaFileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('audio/')) {
        return cb(new appError_1.AppError('Only image and audio files are allowed', httpStatus_enum_1.HttpStatus.BAD_REQUEST));
    }
    cb(null, true);
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for images
    },
});
exports.chatUploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter: chatMediaFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB for chat media (images 5MB, audio 10MB)
    },
});
