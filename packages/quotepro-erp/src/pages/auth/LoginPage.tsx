import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card, Alert } from '@components/index'
import { Mail, Lock, Building2 } from 'lucide-react'
import { useAuthStore } from '@store/auth'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-blue-900 flex items-center justify-center p-md">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <div className="text-center mb-lg">
            <div className="flex items-center justify-center gap-xs mb-md">
              <Building2 size={32} className="text-brand-primary" />
              <h1 className="text-3xl font-bold text-brand-primary">QuotePro</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Professional Quotation & Tender Management
            </p>
          </div>

          {error && (
            <div className="mb-md">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-xs cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-slate-700 dark:text-slate-300">Remember me</span>
              </label>
              <a href="#" className="text-brand-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              type="submit"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-brand-primary hover:underline font-medium">
                Sign up
              </a>
            </p>
          </form>
        </Card>

        <div className="mt-lg text-center text-sm text-white/80">
          <p>Demo credentials: demo@quotepro.com / password</p>
        </div>
      </div>
    </div>
  )
}
