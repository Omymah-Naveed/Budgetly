import { CheckCircle2 } from 'lucide-react'

export default function Feedback({ error, message }) {
  if (error) {
    return (
      <p
        role="alert"
        className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-[11px] font-medium leading-5 text-rose-700 ring-1 ring-rose-100"
      >
        {error}
      </p>
    )
  }

  if (message) {
    return (
      <p
        role="status"
        className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100"
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {message}
      </p>
    )
  }

  return null
}
