import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-md transition-all duration-base flex items-center justify-center gap-xs'

  const variantStyles = {
    primary: 'bg-brand-primary text-white hover:bg-blue-700 disabled:bg-slate-400',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 disabled:bg-slate-400',
    success: 'bg-brand-success text-white hover:bg-green-600 disabled:bg-slate-400',
    danger: 'bg-brand-danger text-white hover:bg-red-600 disabled:bg-slate-400',
    warning: 'bg-brand-warning text-white hover:bg-orange-600 disabled:bg-slate-400',
    ghost: 'bg-transparent text-brand-primary hover:bg-brand-primary hover:bg-opacity-10',
  }

  const sizeStyles = {
    sm: 'px-xs py-2xs text-sm',
    md: 'px-sm py-xs text-base',
    lg: 'px-md py-sm text-lg',
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className || ''}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  )
}
