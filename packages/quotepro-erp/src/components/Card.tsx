import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-md p-md
        shadow-soft dark:shadow-md
        border border-slate-200 dark:border-slate-700
        transition-all duration-base
        ${hover ? 'hover:shadow-md dark:hover:shadow-lg cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className || ''}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
