export interface User {
  id: string;
  username: string;
  avatar?: string;
  online: boolean;
  lastSeen: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  participants: string[];
  createdAt: Date;
  lastMessage?: Message;
  online?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TypingStatus {
  chatId: string;
  userId: string;
  username: string;
}
