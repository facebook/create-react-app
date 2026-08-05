import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
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
        <select
          className={`
            w-full px-sm py-xs rounded-md border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            transition-all duration-base appearance-none
            ${error ? 'border-brand-danger focus:ring-brand-danger' : ''}
            ${className || ''}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-sm top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      {error && (
        <p className="text-sm text-brand-danger">{error}</p>
      )}
    </div>
  )
}
