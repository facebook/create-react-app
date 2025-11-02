export interface User {
  id: string;
  username: string;
  password: string;
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
  participants: string[];
  createdAt: Date;
  lastMessage?: Message;
}

export interface TypingStatus {
  chatId: string;
  userId: string;
  username: string;
}

export interface UserPublic {
  id: string;
  username: string;
  avatar?: string;
  online: boolean;
  lastSeen: Date;
}
