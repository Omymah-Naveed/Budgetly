import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  tone = 'emerald',
  dark = false,
  changeTone = 'good',
}) {
  const isPositive = change >= 0
  const ChangeIcon = change === 0 ? Minus : isPositive ? ArrowUpRight : ArrowDownRight
  const favorable = changeTone === 'good'
  const neutral = changeTone === 'neutral'

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 transition-all duration-300',
        dark
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 shadow-xl shadow-slate-950/10 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-950/15'
          : 'card-surface hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.06]',
      )}
    >
      {dark ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[22px] border-emerald-400/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl"
          />
        </>
      ) : null}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              'text-xs font-semibold',
              dark ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'mt-2.5 truncate text-[26px] font-extrabold leading-none tracking-tight tabular-nums',
              dark ? 'text-white' : 'text-slate-950',
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset',
            dark
              ? 'bg-white/[0.08] text-emerald-300 ring-white/[0.08]'
              : TONES[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-5 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold',
            neutral
              ? dark
                ? 'bg-white/10 text-slate-300'
                : 'bg-slate-100 text-slate-600'
              : favorable
                ? dark
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-emerald-50 text-emerald-700'
                : dark
                  ? 'bg-rose-400/15 text-rose-300'
                  : 'bg-rose-50 text-rose-700',
          )}
        >
          <ChangeIcon className="h-3 w-3" aria-hidden="true" />
          {Math.abs(Number(change) || 0).toFixed(1)}%
        </span>
        <span
          className={cn(
            'truncate text-[11px]',
            dark ? 'text-slate-500' : 'text-slate-400',
          )}
        >
          {changeLabel}
        </span>
      </div>
    </article>
  )
}
