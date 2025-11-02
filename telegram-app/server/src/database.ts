import { User, Message, Chat, UserPublic } from './types';

class Database {
  private users: Map<string, User> = new Map();
  private messages: Map<string, Message> = new Map();
  private chats: Map<string, Chat> = new Map();
  private userSockets: Map<string, string> = new Map();

  // User methods
  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  getAllUsers(): UserPublic[] {
    return Array.from(this.users.values()).map(u => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      online: u.online,
      lastSeen: u.lastSeen,
    }));
  }

  updateUserStatus(userId: string, online: boolean): void {
    const user = this.users.get(userId);
    if (user) {
      user.online = online;
      user.lastSeen = new Date();
    }
  }

  // Socket mapping
  setUserSocket(userId: string, socketId: string): void {
    this.userSockets.set(userId, socketId);
  }

  getUserSocket(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  removeUserSocket(userId: string): void {
    this.userSockets.delete(userId);
  }

  // Message methods
  createMessage(message: Message): Message {
    this.messages.set(message.id, message);
    const chat = this.chats.get(message.chatId);
    if (chat) {
      chat.lastMessage = message;
    }
    return message;
  }

  getMessagesByChatId(chatId: string): Message[] {
    return Array.from(this.messages.values())
      .filter(m => m.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  markMessageAsRead(messageId: string): void {
    const message = this.messages.get(messageId);
    if (message) {
      message.read = true;
    }
  }

  // Chat methods
  createChat(chat: Chat): Chat {
    this.chats.set(chat.id, chat);
    return chat;
  }

  getChatById(id: string): Chat | undefined {
    return this.chats.get(id);
  }

  getChatsByUserId(userId: string): Chat[] {
    return Array.from(this.chats.values())
      .filter(c => c.participants.includes(userId))
      .sort((a, b) => {
        const aTime = a.lastMessage?.timestamp.getTime() || a.createdAt.getTime();
        const bTime = b.lastMessage?.timestamp.getTime() || b.createdAt.getTime();
        return bTime - aTime;
      });
  }

  findPrivateChat(user1Id: string, user2Id: string): Chat | undefined {
    return Array.from(this.chats.values()).find(
      c =>
        c.type === 'private' &&
        c.participants.includes(user1Id) &&
        c.participants.includes(user2Id)
    );
  }

  searchChats(userId: string, query: string): Chat[] {
    const userChats = this.getChatsByUserId(userId);
    return userChats.filter(chat => {
      if (chat.type === 'group' && chat.name) {
        return chat.name.toLowerCase().includes(query.toLowerCase());
      }
      const otherUserId = chat.participants.find(p => p !== userId);
      if (otherUserId) {
        const otherUser = this.getUserById(otherUserId);
        return otherUser?.username.toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });
  }
}

export const db = new Database();
