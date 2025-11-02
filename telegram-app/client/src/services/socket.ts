import { io, Socket } from 'socket.io-client';
import { Message, TypingStatus } from '../types';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:5000', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) {
    if (this.socket) {
      this.socket.emit('message:send', { chatId, content, type, fileUrl, fileName });
    }
  }

  markMessageAsRead(messageId: string, chatId: string) {
    if (this.socket) {
      this.socket.emit('message:read', { messageId, chatId });
    }
  }

  startTyping(chatId: string) {
    if (this.socket) {
      this.socket.emit('typing:start', { chatId });
    }
  }

  stopTyping(chatId: string) {
    if (this.socket) {
      this.socket.emit('typing:stop', { chatId });
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message:new', callback);
    }
  }

  onMessageRead(callback: (data: { messageId: string; chatId: string }) => void) {
    if (this.socket) {
      this.socket.on('message:read', callback);
    }
  }

  onTypingStart(callback: (data: TypingStatus) => void) {
    if (this.socket) {
      this.socket.on('typing:start', callback);
    }
  }

  onTypingStop(callback: (data: { chatId: string; userId: string }) => void) {
    if (this.socket) {
      this.socket.on('typing:stop', callback);
    }
  }

  onUserStatus(callback: (data: { userId: string; online: boolean; lastSeen: Date }) => void) {
    if (this.socket) {
      this.socket.on('user:status', callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
