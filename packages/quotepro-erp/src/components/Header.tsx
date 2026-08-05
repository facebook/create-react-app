import React, { useState } from 'react'
import { Bell, Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@hooks/useTheme'
import { Avatar } from './Avatar'
import { useAuthStore } from '@store/auth'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuthStore()
  const [hasNotifications, setHasNotifications] = useState(true)

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="px-md py-sm flex items-center justify-between gap-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Menu size={24} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-sm">
          <button
            onClick={toggleTheme}
            className="p-2xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-400"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button className="relative p-2xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-400">
            <Bell size={20} />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-danger rounded-full" />
            )}
          </button>

          {user && (
            <div className="flex items-center gap-sm pl-sm border-l border-slate-200 dark:border-slate-700">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.role}
                </p>
              </div>
              <Avatar name={user.name} size="md" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
