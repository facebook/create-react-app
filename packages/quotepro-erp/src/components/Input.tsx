import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2xs">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-brand-danger ml-2xs">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-sm top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-sm py-xs rounded-md border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            transition-all duration-base
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-brand-danger focus:ring-brand-danger' : ''}
            ${className || ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-brand-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  )
}
