import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '@components/index'
import { AlertCircle, Home } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-blue-900 flex items-center justify-center p-md">
      <Card className="max-w-md w-full shadow-lg">
        <div className="text-center space-y-md">
          <div className="flex justify-center">
            <div className="p-md rounded-lg bg-red-100 dark:bg-red-900/30 text-brand-danger">
              <AlertCircle size={48} />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-brand-danger mb-sm">404</h1>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-xs">
              Page Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Sorry, the page you're looking for doesn't exist.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-sm"
          >
            <Home size={18} />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
