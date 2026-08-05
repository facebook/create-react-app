import React from 'react'

interface BadgeProps {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'sm',
  children,
  className,
}) => {
  const variantStyles = {
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    info: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
  }

  const sizeStyles = {
    sm: 'px-xs py-2xs text-xs font-medium rounded-xs',
    md: 'px-sm py-xs text-sm font-medium rounded-sm',
  }

  return (
    <span className={`inline-block ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}>
      {children}
    </span>
  )
}
