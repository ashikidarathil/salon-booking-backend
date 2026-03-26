import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { container } from 'tsyringe';
import { TOKENS } from '../common/di/tokens';
import { IChatService } from '../modules/chat/service/IChatService';
import { logInfo, logError } from '../logger/log.util';
import { env } from '../config/env';

const messageRateLimits = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MS = 5000;
const RATE_LIMIT_MAX_MESSAGES = 5;

type SendMessageData = Parameters<IChatService['sendMessage']>[0];

export class SocketService {
  private static io: Server;

  static init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: env.FRONTEND_ORIGIN,
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

    this.io.on('connection', (socket: Socket) => {
      logInfo(`[Socket connected] userId: ${socket.data.userId}, socketId: ${socket.id}`);

      // User connection room
      socket.join(`user_${socket.data.userId}`);

      socket.on('joinChat', (roomId: string) => {
        socket.join(roomId);
        logInfo(`User ${socket.data.userId} joined room ${roomId}`);
      });

      socket.on('leaveChat', (roomId: string) => {
        socket.leave(roomId);
        logInfo(`User ${socket.data.userId} left room ${roomId}`);
      });

      socket.on('sendMessage', async (data: SendMessageData) => {
        try {
          // Rate limiting
          const now = Date.now();
          let userRate = messageRateLimits.get(data.senderId);
          if (!userRate || now - userRate.windowStart > RATE_LIMIT_MS) {
            userRate = { count: 1, windowStart: now };
            messageRateLimits.set(data.senderId, userRate);
          } else {
            userRate.count++;
            if (userRate.count > RATE_LIMIT_MAX_MESSAGES) {
              socket.emit('error', { message: 'Rate limit exceeded. Try again in 5 seconds.' });
              return;
            }
          }

          const chatService = container.resolve<IChatService>(TOKENS.ChatService);

          const message = await chatService.sendMessage(data);

          this.io.to(data.chatRoomId).emit('newMessage', message);
        } catch (error) {
          const err = error as Error;
          logError('Socket sendMessage error', { message: err.message });
          socket.emit('error', { message: err.message || 'Failed to send message' });
        }
      });

      socket.on('disconnect', () => {
        logInfo(`[Socket disconnected] userId: ${socket.data.userId}`);
      });
    });
  }

  static getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io not initialized!');
    }
    return this.io;
  }

  static sendToUser(userId: string, event: string, data: unknown) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }
}
