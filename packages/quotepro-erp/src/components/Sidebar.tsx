import React from 'react'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { Avatar } from './Avatar'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuthStore()

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Quotations', icon: FileText, path: '/quotations' },
    { label: 'Clients', icon: Users, path: '/clients' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800
          border-r border-slate-200 dark:border-slate-700
          z-40 transition-transform duration-base
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-primary">QuotePro</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-md overflow-y-auto">
          <div className="space-y-xs">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-sm px-sm py-xs rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={onClose}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-md border-t border-slate-200 dark:border-slate-700 space-y-sm">
          {user && (
            <div className="flex items-center gap-sm mb-md pb-md border-b border-slate-200 dark:border-slate-700">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="w-full flex items-center gap-sm px-sm py-xs rounded-md text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
