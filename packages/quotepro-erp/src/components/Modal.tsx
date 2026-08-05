import React, { useState } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/60 transition-opacity"
        onClick={onClose}
      />
      <div
        className={`
          relative bg-white dark:bg-slate-800 rounded-lg shadow-lg
          ${sizeStyles[size]} w-full mx-md max-h-[90vh] overflow-y-auto
          animate-fade-in
        `}
      >
        {title && (
          <div className="flex items-center justify-between p-md border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-md">
          {children}
        </div>
        {footer && (
          <div className="p-md border-t border-slate-200 dark:border-slate-700 flex justify-end gap-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
