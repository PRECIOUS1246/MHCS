import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ChatMessage, User } from '../models';
import { setSocketIO } from '../services/notificationService';
import { JwtPayload } from '../types';

const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  setSocketIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.data.user = {
        id: decoded.userId,
        nickname: user.anonymousNickname || user.firstName,
        role: decoded.role,
      };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    const nickname = socket.data.user.nickname;

    socket.join(`user:${userId}`);
    onlineUsers.set(userId, socket.id);
    io.emit('user:online', { userId, nickname });

    socket.on('chat:join', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('chat:user-joined', { nickname });
    });

    socket.on('chat:leave', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('chat:typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      socket.to(roomId).emit('chat:typing', { userId, nickname, isTyping });
    });

    socket.on(
      'chat:message',
      async ({
        roomId,
        content,
        isAnonymous = true,
      }: {
        roomId: string;
        content: string;
        isAnonymous?: boolean;
      }) => {
        if (!content?.trim() || content.length > 2000) return;

        const message = await ChatMessage.create({
          roomId,
          senderId: userId,
          senderNickname: isAnonymous ? nickname : socket.data.user.nickname,
          content: content.trim(),
          isAnonymous,
        });

        io.to(roomId).emit('chat:message', {
          id: message._id,
          roomId,
          senderId: message.senderId.toString(),
          senderNickname: message.senderNickname,
          content: message.content,
          isAnonymous: message.isAnonymous,
          createdAt: message.createdAt,
        });
      }
    );

    socket.on('chat:delete', async ({ messageId }: { messageId: string }) => {
      if (!messageId) return;

      const message = await ChatMessage.findById(messageId);
      if (!message) return;
      if (message.senderId.toString() !== userId) return;

      await ChatMessage.findByIdAndDelete(messageId);
      io.to(message.roomId).emit('chat:deleted', { id: messageId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
    });
  });

  return io;
};
