import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
} from 'lucide-react'
import { forgotPassword } from '../../services/account'
import { getApiErrorMessage } from '../../services/api'
import Button from '../ui/Button'

const fieldClass =
  'h-11 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40'

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      setError('Enter the email address for your account.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await forgotPassword(email.trim().toLowerCase())
      setIsSent(true)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-bold text-slate-900">
          Check your inbox
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          If an account exists for <strong>{email}</strong>, we sent a password
          reset link. It expires in 30 minutes.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-5 w-full"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Button>
      </div>
    )
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

      <p className="mb-4 text-sm leading-6 text-slate-500">
        Enter your account email and we will send you a secure link to choose a
        new password.
      </p>

      <label
        htmlFor="forgot-email"
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
          id="forgot-email"
          data-autofocus
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError('')
          }}
          placeholder="you@example.com"
          className={fieldClass}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending link...
          </>
        ) : (
          <>
            Send reset link
            <Send className="h-4 w-4" aria-hidden="true" />
          </>
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
