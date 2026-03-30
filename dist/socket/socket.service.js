"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../common/di/tokens");
const log_util_1 = require("../logger/log.util");
const env_1 = require("../config/env");
const messageRateLimits = new Map();
const RATE_LIMIT_MS = 5000;
const RATE_LIMIT_MAX_MESSAGES = 5;
class SocketService {
    static init(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: env_1.env.FRONTEND_ORIGIN,
                credentials: true,
            },
            pingTimeout: 60000,
        });
        this.io.use((socket, next) => {
            const userId = socket.handshake.query.userId || socket.handshake.auth.userId;
            if (!userId) {
                return next(new Error('Authentication error'));
            }
            socket.data.userId = userId;
            next();
        });
        this.io.on('connection', (socket) => {
            (0, log_util_1.logInfo)(`[Socket connected] userId: ${socket.data.userId}, socketId: ${socket.id}`);
            // User connection room
            socket.join(`user_${socket.data.userId}`);
            socket.on('joinChat', (roomId) => {
                socket.join(roomId);
                (0, log_util_1.logInfo)(`User ${socket.data.userId} joined room ${roomId}`);
            });
            socket.on('leaveChat', (roomId) => {
                socket.leave(roomId);
                (0, log_util_1.logInfo)(`User ${socket.data.userId} left room ${roomId}`);
            });
            socket.on('sendMessage', async (data) => {
                try {
                    // Rate limiting
                    const now = Date.now();
                    let userRate = messageRateLimits.get(data.senderId);
                    if (!userRate || now - userRate.windowStart > RATE_LIMIT_MS) {
                        userRate = { count: 1, windowStart: now };
                        messageRateLimits.set(data.senderId, userRate);
                    }
                    else {
                        userRate.count++;
                        if (userRate.count > RATE_LIMIT_MAX_MESSAGES) {
                            socket.emit('error', { message: 'Rate limit exceeded. Try again in 5 seconds.' });
                            return;
                        }
                    }
                    const chatService = tsyringe_1.container.resolve(tokens_1.TOKENS.ChatService);
                    const message = await chatService.sendMessage(data);
                    this.io.to(data.chatRoomId).emit('newMessage', message);
                }
                catch (error) {
                    const err = error;
                    (0, log_util_1.logError)('Socket sendMessage error', { message: err.message });
                    socket.emit('error', { message: err.message || 'Failed to send message' });
                }
            });
            socket.on('disconnect', () => {
                (0, log_util_1.logInfo)(`[Socket disconnected] userId: ${socket.data.userId}`);
            });
        });
    }
    static getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }
    static sendToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user_${userId}`).emit(event, data);
        }
    }
}
exports.SocketService = SocketService;
