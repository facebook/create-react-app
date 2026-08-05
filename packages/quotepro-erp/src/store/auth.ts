import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  company: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string, company: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const user: User = {
      id: '1',
      email,
      name: 'John Doe',
      company: 'Acme Corp',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    }
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  register: async (email: string, password: string, name: string, company: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const user: User = {
      id: '1',
      email,
      name,
      company,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    }
    set({ user, isAuthenticated: true })
  },
}))
