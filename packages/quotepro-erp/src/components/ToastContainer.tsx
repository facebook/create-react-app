import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  }

  const textColors = {
    success: 'text-green-800 dark:text-green-300',
    error: 'text-red-800 dark:text-red-300',
    warning: 'text-yellow-800 dark:text-yellow-300',
    info: 'text-blue-800 dark:text-blue-300',
  }

  return (
    <div className="fixed top-md right-md z-50 flex flex-col gap-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex gap-md items-start p-md rounded-md border ${bgColors[toast.type]} ${textColors[toast.type]} animate-slide-in`}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <p className="flex-1 text-sm">{toast.message}</p>
          <button
            onClick={() => onClose(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
