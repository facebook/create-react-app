import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoutes from './routes/chats';
import uploadRoutes from './routes/upload';
import { Message, TypingStatus } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`User connected: ${userId}`);

  db.setUserSocket(userId, socket.id);
  db.updateUserStatus(userId, true);

  io.emit('user:status', {
    userId,
    online: true,
    lastSeen: new Date(),
  });

  socket.on('message:send', (data: { chatId: string; content: string; type?: 'text' | 'image' | 'file'; fileUrl?: string; fileName?: string }) => {
    const message: Message = {
      id: uuidv4(),
      chatId: data.chatId,
      senderId: userId,
      content: data.content,
      type: data.type || 'text',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      timestamp: new Date(),
      read: false,
    };

    db.createMessage(message);

    const chat = db.getChatById(data.chatId);
    if (chat) {
      chat.participants.forEach((participantId) => {
        const socketId = db.getUserSocket(participantId);
        if (socketId) {
          io.to(socketId).emit('message:new', message);
        }
      });
    }
  });

  socket.on('message:read', (data: { messageId: string; chatId: string }) => {
    db.markMessageAsRead(data.messageId);

    const chat = db.getChatById(data.chatId);
    if (chat) {
      chat.participants.forEach((participantId) => {
        if (participantId !== userId) {
          const socketId = db.getUserSocket(participantId);
          if (socketId) {
            io.to(socketId).emit('message:read', {
              messageId: data.messageId,
              chatId: data.chatId,
            });
          }
        }
      });
    }
  });

  socket.on('typing:start', (data: { chatId: string }) => {
    const user = db.getUserById(userId);
    if (!user) return;

    const chat = db.getChatById(data.chatId);
    if (chat) {
      const typingStatus: TypingStatus = {
        chatId: data.chatId,
        userId,
        username: user.username,
      };

      chat.participants.forEach((participantId) => {
        if (participantId !== userId) {
          const socketId = db.getUserSocket(participantId);
          if (socketId) {
            io.to(socketId).emit('typing:start', typingStatus);
          }
        }
      });
    }
  });

  socket.on('typing:stop', (data: { chatId: string }) => {
    const chat = db.getChatById(data.chatId);
    if (chat) {
      chat.participants.forEach((participantId) => {
        if (participantId !== userId) {
          const socketId = db.getUserSocket(participantId);
          if (socketId) {
            io.to(socketId).emit('typing:stop', {
              chatId: data.chatId,
              userId,
            });
          }
        }
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    db.removeUserSocket(userId);
    db.updateUserStatus(userId, false);

    io.emit('user:status', {
      userId,
      online: false,
      lastSeen: new Date(),
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
