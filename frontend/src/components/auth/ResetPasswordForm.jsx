import { useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { resetPassword } from '../../services/account'
import { getApiErrorMessage } from '../../services/api'
import Button from '../ui/Button'

const fieldClass =
  'h-11 w-full rounded-xl border-0 bg-white pl-10 pr-11 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40'

export default function ResetPasswordForm({ token, onSuccess, onBack }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      setError('This password reset link is missing its token.')
      return
    }

    if (form.password.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const data = await resetPassword({
        token,
        newPassword: form.password,
      })
      onSuccess?.(data?.message)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {!token ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-rose-700"
        >
          This password reset link is invalid or incomplete. Request a new
          link.
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-rose-700"
        >
          {error}
        </div>
      ) : null}

      <p className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[11px] leading-5 text-emerald-700 ring-1 ring-emerald-100">
        <ShieldCheck
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        />
        Reset links are single-use and expire after 30 minutes.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="reset-password"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            New password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="reset-password"
              data-autofocus
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
            htmlFor="reset-confirm-password"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Confirm new password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="reset-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              placeholder="Repeat new password"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !token}
        className="mt-5 w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Resetting password...
          </>
        ) : (
          'Reset password'
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 flex w-full items-center justify-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to sign in
      </button>
    </form>
  )
}
