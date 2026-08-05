import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  type?: AlertType
  title?: string
  message: string
  onClose?: () => void
  closeable?: boolean
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  closeable = true,
}) => {
  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  }

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  }

  return (
    <div className={`flex gap-md items-start p-md rounded-md border ${styles[type]}`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-2xs">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      {closeable && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
