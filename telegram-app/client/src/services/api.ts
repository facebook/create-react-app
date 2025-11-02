import axios from 'axios';
import { AuthResponse, User, Chat, Message } from '../types';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, password }),
  
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),
};

export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
};

export const chatAPI = {
  getAll: () => api.get<Chat[]>('/chats'),
  create: (participantId: string, type: 'private' | 'group' = 'private', name?: string) =>
    api.post<Chat>('/chats', { participantId, type, name }),
  getMessages: (chatId: string) => api.get<Message[]>(`/chats/${chatId}/messages`),
  search: (query: string) => api.get<Chat[]>('/chats/search', { params: { q: query } }),
};

export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ fileUrl: string; fileName: string; fileSize: number }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
