import { useState } from 'react'
import {
  ArrowUpRight,
  ChartPie,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'

const HIGHLIGHTS = [
  {
    icon: ChartPie,
    title: 'Live cash flow',
    description: 'See income, spending, and savings update the moment you log a transaction.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    description: 'Your transactions are protected by JWT authentication and scoped to your account.',
  },
]

const INITIAL_MODE =
  typeof window !== 'undefined' && window.location.pathname === '/reset-password'
    ? 'reset'
    : 'login'

const AUTH_COPY = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign in to Budgetly',
    description: 'Pick up right where you left off.',
  },
  register: {
    eyebrow: 'Get started',
    title: 'Create your account',
    description: 'Start tracking your money in under a minute.',
  },
  forgot: {
    eyebrow: 'Account recovery',
    title: 'Forgot your password?',
    description: 'We will email you a secure reset link.',
  },
  reset: {
    eyebrow: 'Account recovery',
    title: 'Choose a new password',
    description: 'Your reset link is valid for 30 minutes.',
  },
}

export default function AuthPage() {
  const [mode, setMode] = useState(INITIAL_MODE)
  const [notice, setNotice] = useState('')
  const [resetToken] = useState(
    () => new URLSearchParams(window.location.search).get('token') || '',
  )
  const copy = AUTH_COPY[mode] || AUTH_COPY.login

  const clearResetRoute = () => {
    if (window.location.pathname === '/reset-password') {
      window.history.replaceState({}, '', '/')
    }
  }

  const showLogin = (message = '') => {
    clearResetRoute()
    setNotice(message)
    setMode('login')
  }

  const switchMode = (nextMode) => {
    clearResetRoute()
    setNotice('')
    setMode(nextMode)
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Wallet className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight text-white">
                Budgetly
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Money, simplified
              </span>
            </span>
          </div>
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/20">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Your financial home
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Every dollar,
            <br />
            finally in focus.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Track spending, plan budgets, and understand your money — all in
            one calm workspace.
          </p>

          <div className="mt-9 space-y-4">
            {HIGHLIGHTS.map((highlight) => {
              const Icon = highlight.icon

              return (
                <div key={highlight.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-400 ring-1 ring-white/10">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {highlight.title}
                    </p>
                    <p className="mt-0.5 max-w-sm text-xs leading-5 text-slate-500">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Built for clarity
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              Budgets, analytics, and export in one place
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Wallet className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-tight text-slate-950">
                Budgetly
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Money, simplified
              </span>
            </span>
          </div>

          <div className="card-surface rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                {copy.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                {copy.title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {copy.description}
              </p>
            </div>

            {notice ? (
              <div
                role="status"
                className="mb-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-emerald-700 ring-1 ring-emerald-100"
              >
                {notice}
              </div>
            ) : null}

            {mode === 'login' ? (
              <LoginForm
                onSwitch={() => switchMode('register')}
                onForgotPassword={() => switchMode('forgot')}
              />
            ) : null}

            {mode === 'register' ? (
              <RegisterForm onSwitch={() => switchMode('login')} />
            ) : null}

            {mode === 'forgot' ? (
              <ForgotPasswordForm onBack={() => showLogin()} />
            ) : null}

            {mode === 'reset' ? (
              <ResetPasswordForm
                token={resetToken}
                onSuccess={(message) =>
                  showLogin(
                    message ||
                      'Password reset successfully. You can now sign in.',
                  )
                }
                onBack={() => showLogin()}
              />
            ) : null}
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Secured with bcrypt password hashing and JSON Web Tokens.
          </p>
        </div>
      </main>
    </div>
  )
}
