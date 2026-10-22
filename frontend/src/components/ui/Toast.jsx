import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const TONES = {
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-emerald-50 text-emerald-600',
    ring: 'ring-emerald-100',
  },
  error: {
    icon: AlertTriangle,
    iconClass: 'bg-rose-50 text-rose-600',
    ring: 'ring-rose-100',
  },
  info: {
    icon: Info,
    iconClass: 'bg-sky-50 text-sky-600',
    ring: 'ring-sky-100',
  },
}

function ToastItem({ toast, onDismiss }) {
  const tone = TONES[toast.type] || TONES.info
  const Icon = tone.icon

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 3800)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full animate-toast-in items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl shadow-slate-950/10 ring-1',
        tone.ring,
      )}
      role="status"
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          tone.iconClass,
        )}
      >
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <p className="flex-1 text-sm font-medium leading-5 text-slate-700">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-20 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:right-5 sm:top-24 sm:w-96"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
