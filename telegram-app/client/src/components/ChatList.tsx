import React, { useState, useEffect } from 'react';
import { Chat, User } from '../types';
import { chatAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    loadChats();
    loadUsers();
  }, []);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getAll();
      setChats(response.data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      const response = await chatAPI.create(userId);
      setChats([response.data, ...chats]);
      setShowNewChat(false);
      onSelectChat(response.data);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="New Chat"
            >
              <svg className="w-6 h-6 text-telegram-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Logout"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-telegram-blue"
        />
      </div>

      {showNewChat && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Start a new chat</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleCreateChat(u.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-white rounded-lg transition"
              >
                <div className="w-10 h-10 bg-telegram-blue rounded-full flex items-center justify-center text-white font-semibold">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800">{u.username}</div>
                  <div className="text-xs text-gray-500">
                    {u.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No chats yet</p>
            <p className="text-sm">Click + to start a conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100 ${
                selectedChatId === chat.id ? 'bg-telegram-blue bg-opacity-10' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-telegram-blue rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.name?.[0]?.toUpperCase() || '?'}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 truncate">{chat.name}</span>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage.content}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
