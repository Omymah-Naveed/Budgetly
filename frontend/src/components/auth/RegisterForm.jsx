import { useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getApiErrorMessage } from '../../services/api'
import Button from '../ui/Button'

const fieldClass =
  'h-11 w-full rounded-xl border-0 bg-white pl-10 pr-11 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterForm({ onSwitch }) {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim()

    if (!name || !email || !form.password) {
      setError('Fill in your name, email, and password.')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address.')
      return
    }

    if (form.password.length < 6) {
      setError('Your password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('The two passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await register({ name, email, password: form.password })
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
            htmlFor="register-name"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Full name
          </label>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="register-name"
              data-autofocus
              type="text"
              autoComplete="name"
              maxLength={80}
              value={form.name}
              onChange={updateField('name')}
              placeholder="Alex Morgan"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
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
              id="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="register-password"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={updateField('password')}
                placeholder="6+ characters"
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

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Confirm password
            </label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                placeholder="Repeat password"
                className={fieldClass}
              />
            </div>
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
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-bold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
