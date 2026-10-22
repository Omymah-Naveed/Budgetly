import { Pencil } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'
import { getBudgetLabel } from '../../utils/finance'
import { formatCurrencyWhole } from '../../utils/format'
import { cn } from '../../utils/cn'
import ProgressBar from '../ui/ProgressBar'

const STATUS_STYLES = {
  safe: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
  },
  over: {
    badge: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-600',
  },
}

export default function BudgetCard({ budget, onEdit }) {
  const meta = CATEGORIES[budget.category]
  const Icon = meta?.icon
  const status = STATUS_STYLES[budget.tone] || STATUS_STYLES.safe
  const over = budget.remaining < 0

  return (
    <article className="card-surface group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${meta?.iconClass || 'bg-slate-50 text-slate-500 ring-slate-100'}`}
          >
            {Icon ? <Icon className="h-4.5 w-4.5" aria-hidden="true" /> : null}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {budget.category}
            </h3>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset',
                status.badge,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
              {getBudgetLabel(budget.tone)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(budget)}
          aria-label={`Edit ${budget.category} budget`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-2xl font-extrabold tracking-tight text-slate-950 tabular-nums">
          {formatCurrencyWhole(budget.spent)}
          <span className="ml-1 text-xs font-medium text-slate-400">
            / {formatCurrencyWhole(budget.limit)}
          </span>
        </p>
        <span
          className={cn(
            'shrink-0 text-sm font-extrabold tabular-nums',
            over
              ? 'text-red-600'
              : budget.tone === 'danger'
                ? 'text-rose-600'
                : budget.tone === 'warning'
                  ? 'text-amber-600'
                  : 'text-emerald-600',
          )}
        >
          {budget.percent}%
        </span>
      </div>

      <ProgressBar
        value={budget.percent}
        tone={budget.tone}
        trackClassName="mt-3 h-2.5"
      />

      <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
        <span className={over ? 'font-semibold text-red-600' : 'text-slate-500'}>
          {over ? (
            <>
              <span className="font-bold">
                {formatCurrencyWhole(Math.abs(budget.remaining))}
              </span>{' '}
              over budget
            </>
          ) : (
            <>
              <span className="font-bold text-slate-700">
                {formatCurrencyWhole(budget.remaining)}
              </span>{' '}
              left to spend
            </>
          )}
        </span>
        <span className="font-medium text-slate-400">
          Limit {formatCurrencyWhole(budget.limit)}
        </span>
      </div>
    </article>
  )
}
