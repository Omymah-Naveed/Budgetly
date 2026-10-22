import { useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getApiErrorMessage } from '../../services/api'
import Button from '../ui/Button'

const fieldClass =
  'h-11 w-full rounded-xl border-0 bg-white pl-10 pr-11 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40'

export default function LoginForm({ onSwitch, onForgotPassword }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password to continue.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-rose-700"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="login-email"
              data-autofocus
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-600"
            >
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="Enter your password"
              className={fieldClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="mt-5 text-center text-xs text-slate-500">
        New to Budgetly?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-bold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          Create an account
        </button>
      </p>
    </form>
  )
}
