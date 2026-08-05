import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  date: string
  status: 'completed' | 'pending' | 'error'
  icon?: React.ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const statusStyles = {
    completed: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    pending: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    error: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  }

  const statusIcons = {
    completed: <CheckCircle size={20} />,
    pending: <Clock size={20} />,
    error: <AlertCircle size={20} />,
  }

  return (
    <div className="space-y-lg">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-md">
          <div className="flex flex-col items-center">
            <div className={`p-xs rounded-full ${statusStyles[item.status]}`}>
              {item.icon || statusIcons[item.status]}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-16 bg-slate-200 dark:bg-slate-700 mt-xs" />
            )}
          </div>
          <div className="pt-xs flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2xs">{item.description}</p>
            )}
            <time className="text-xs text-slate-500 dark:text-slate-500 mt-2xs block">
              {item.date}
            </time>
          </div>
        </div>
      ))}
    </div>
  )
}
