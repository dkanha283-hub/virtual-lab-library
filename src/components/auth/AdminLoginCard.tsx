import React, { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, LogIn } from 'lucide-react'
import { useLabStore } from '../../context/LabStoreContext'
import { Card, Button, FormField, inputClassName, Badge } from '../ui/DesignSystem'

interface Props {
  title?: string
  subtitle?: string
  onSuccess?: () => void
}

export function AdminLoginCard({
  title = 'Administrator Authentication Required',
  subtitle = 'Sign in with your Admin email and password to create experiments, import HTML 3D models / virtual labs, and manage departments.',
  onSuccess,
}: Props) {
  const { loginAsAdmin, supabaseConnected } = useLabStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await loginAsAdmin(email, password)
    setLoading(false)
    if (res.ok) {
      if (onSuccess) onSuccess()
    } else {
      setError(res.error || 'Authentication failed.')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="p-6 sm:p-8 space-y-6 shadow-md border-slate-200">
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex justify-center">
            <Badge tone={supabaseConnected ? 'teal' : 'slate'}>
              <ShieldCheck className="w-3 h-3" />
              {supabaseConnected ? 'Supabase Auth Enabled' : 'Password-Protected Admin Portal'}
            </Badge>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Admin Email" required>
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="admin@vlab.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Admin Password" required>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClassName} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label={showPass ? 'Hide Password' : 'Show Password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            <LogIn className="w-4 h-4" />
            {loading ? 'Verifying Credentials...' : 'Unlock Admin Workspace'}
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
          Students do not need a password to browse published experiments, 3D models, and virtual simulations.
        </div>
      </Card>
    </div>
  )
}
