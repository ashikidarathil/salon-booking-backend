"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
process.on('uncaughtException', (err) => {
    console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('CRITICAL UNHANDLED REJECTION:', reason);
});
const env_1 = require("./config/env");
const log_util_1 = require("./logger/log.util");
const http_1 = __importDefault(require("http"));
const socket_service_1 = require("./socket/socket.service");
const server = http_1.default.createServer(app_1.default);
socket_service_1.SocketService.init(server);
server.listen(env_1.env.PORT, () => {
    (0, log_util_1.logInfo)(`Backend running on http://localhost:${env_1.env.PORT}`);
});
