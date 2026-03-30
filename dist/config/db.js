"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const log_util_1 = require("../logger/log.util");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        (0, log_util_1.logInfo)('MongoDB connected successfully');
    }
    catch {
        (0, log_util_1.logError)('MongoDB connection failed:');
        process.exit(1);
    }
};
exports.connectDB = connectDB;
