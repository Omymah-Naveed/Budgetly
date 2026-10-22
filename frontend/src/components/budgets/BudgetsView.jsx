import { useMemo } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react'
import {
  getBudgetLabel,
  getBudgetTone,
  getBudgetUsage,
  getMonthTotals,
  getOverallBudget,
} from '../../utils/finance'
import { getMonthLabel, shiftMonthKey } from '../../utils/date'
import { formatCurrencyWhole } from '../../utils/format'
import { cn } from '../../utils/cn'
import BudgetCard from './BudgetCard'
import ProgressBar from '../ui/ProgressBar'
import EmptyState from '../ui/EmptyState'

const GAUGE_COLORS = {
  safe: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  over: '#dc2626',
}

const HERO_STATUS_STYLES = {
  safe: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  warning: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  danger: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  over: 'bg-red-400/10 text-red-300 ring-red-400/20',
}

const STATUS_ROWS = [
  { key: 'safe', label: 'On track', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  { key: 'warning', label: 'Watch limit', dot: 'bg-amber-500', text: 'text-amber-600' },
  { key: 'danger', label: 'Near limit', dot: 'bg-rose-500', text: 'text-rose-600' },
  { key: 'over', label: 'Over budget', dot: 'bg-red-600', text: 'text-red-600' },
]

function BudgetHealthGauge({ usage, overall }) {
  const ratio = overall.limit > 0 ? overall.spent / overall.limit : 0
  const tone = getBudgetTone(ratio)
  const color = GAUGE_COLORS[tone]
  const circumference = 2 * Math.PI * 50
  const offset = circumference - Math.min(1, ratio) * circumference
  const pressure = [...usage].sort((a, b) => b.ratio - a.ratio)[0]

  const counts = usage.reduce(
    (result, budget) => {
      result[budget.tone] = (result[budget.tone] || 0) + 1
      return result
    },
    { safe: 0, warning: 0, danger: 0, over: 0 },
  )

  return (
    <section className="card-surface flex flex-col rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Budget health</h2>
          <p className="mt-1 text-xs text-slate-500">
            A live pulse on your monthly plan
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="relative mx-auto mt-4 h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-950 tabular-nums">
            {Math.round(ratio * 100)}%
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            of limit used
          </span>
          <span
            className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ color, backgroundColor: `${color}14` }}
          >
            {getBudgetLabel(tone)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {STATUS_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <span className={cn('h-1.5 w-1.5 rounded-full', row.dot)} />
              {row.label}
            </span>
            <span className={cn('text-xs font-extrabold tabular-nums', row.text)}>
              {counts[row.key] || 0}
            </span>
          </div>
        ))}
      </div>

      {pressure ? (
        <div className="mt-auto pt-4">
          <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Biggest pressure
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              <span className="font-bold text-slate-900">
                {pressure.category}
              </span>{' '}
              is at{' '}
              <span
                className="font-bold"
                style={{ color: GAUGE_COLORS[pressure.tone] }}
              >
                {pressure.percent}%
              </span>{' '}
              {pressure.remaining >= 0
                ? `with ${formatCurrencyWhole(pressure.remaining)} left.`
                : `and ${formatCurrencyWhole(Math.abs(pressure.remaining))} over.`}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default function BudgetsView({
  budgets,
  transactions,
  totalLimit,
  monthKey,
  currentMonthKey,
  isLoading,
  error,
  onMonthChange,
  onRetry,
  onEditBudget,
  onEditTotalBudget,
}) {
  const isCurrentMonth = monthKey === currentMonthKey

  const { usage, categoryOverall, monthlySpent } = useMemo(() => {
    const nextUsage = getBudgetUsage(budgets, transactions, monthKey)
    return {
      usage: nextUsage,
      categoryOverall: getOverallBudget(nextUsage),
      monthlySpent: getMonthTotals(transactions, monthKey).expenses,
    }
  }, [budgets, transactions, monthKey])

  const limit = totalLimit > 0 ? totalLimit : categoryOverall.limit
  const overall = { limit, spent: monthlySpent }
  const ratio = overall.limit > 0 ? overall.spent / overall.limit : 0
  const tone = getBudgetTone(ratio)
  const remaining = overall.limit - overall.spent
  const [year, month] = monthKey.split('-').map(Number)
  const today = new Date()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysLeft = isCurrentMonth
    ? Math.max(1, daysInMonth - today.getDate() + 1)
    : 0
  const dailyAllowance = isCurrentMonth
    ? Math.max(0, remaining) / Math.max(1, daysLeft)
    : monthlySpent / daysInMonth
  const onTrack = usage.filter((budget) => budget.tone === 'safe').length
  const canGoNext = monthKey < currentMonthKey

  const periodControls = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
          Budget history
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Review and adjust your monthly plan across periods.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isCurrentMonth ? (
          <button
            type="button"
            onClick={() => onMonthChange(currentMonthKey)}
            className="rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-emerald-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50"
          >
            Current month
          </button>
        ) : null}

        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="min-w-32 px-2 text-center text-xs font-bold text-slate-800">
            {getMonthLabel(monthKey, 'long')}
          </span>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
            disabled={!canGoNext}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        {periodControls}
        <section className="card-surface flex min-h-64 flex-col items-center justify-center rounded-2xl p-8 text-center">
          <Loader2
            className="h-6 w-6 animate-spin text-emerald-600"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading {getMonthLabel(monthKey, 'long')} budget...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Preparing your category limits and spending history.
          </p>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {periodControls}
        <section className="card-surface flex min-h-64 flex-col items-center justify-center rounded-2xl p-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-900">
            Could not load this month&apos;s budget
          </p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {periodControls}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-6 shadow-xl shadow-slate-950/10 sm:p-7 xl:col-span-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-emerald-400/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-emerald-300 ring-1 ring-white/10">
                  <Target className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Monthly plan
                  </p>
                  <p className="text-sm font-bold text-white">
                    {getMonthLabel(monthKey, 'long')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEditTotalBudget}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/25 transition hover:bg-emerald-400/25 hover:text-emerald-200"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit limit
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-slate-300 ring-1 ring-white/10">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  {isCurrentMonth
                    ? `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`
                    : 'Month closed'}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total spent
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {formatCurrencyWhole(overall.spent)}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  across {usage.length} category budgets ·{' '}
                  <span className="font-semibold text-slate-300">
                    {formatCurrencyWhole(overall.limit)} limit
                  </span>
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1',
                  HERO_STATUS_STYLES[tone],
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {getBudgetLabel(tone)}
              </span>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Budget used</span>
                <span className="text-white tabular-nums">
                  {Math.round(ratio * 100)}%
                </span>
              </div>
              <ProgressBar
                value={ratio * 100}
                tone={tone}
                trackClassName="h-2.5 bg-white/10"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/[0.08] pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {remaining >= 0 ? 'Left to spend' : 'Over budget'}
                </p>
                <p
                  className={cn(
                    'mt-1 text-lg font-bold tabular-nums',
                    remaining >= 0 ? 'text-white' : 'text-rose-400',
                  )}
                >
                  {formatCurrencyWhole(Math.abs(remaining))}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isCurrentMonth ? 'Safe daily spend' : 'Avg daily spend'}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-white">
                  {formatCurrencyWhole(dailyAllowance)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Categories on track
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-white">
                  {onTrack}
                  <span className="text-sm font-semibold text-slate-500">
                    {' '}
                    / {usage.length}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {usage.length > 0 ? (
          <BudgetHealthGauge usage={usage} overall={overall} />
        ) : (
          <section className="card-surface flex items-center justify-center rounded-2xl">
            <EmptyState
              compact
              icon={Target}
              title="No budgets set"
              description="Budget health will appear after you create category limits."
            />
          </section>
        )}
      </div>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Category budgets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Progress updates instantly as you log expenses.
            </p>
          </div>
          <div className="hidden items-center gap-3 text-[10px] font-semibold text-slate-400 lg:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              On track
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              70%+
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              80%+
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Over
            </span>
          </div>
        </div>

        {usage.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {usage.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={onEditBudget}
              />
            ))}
          </div>
        ) : (
          <div className="card-surface mt-4 rounded-2xl">
            <EmptyState
              icon={Target}
              title="No category budgets yet"
              description="Add budget limits to start tracking your spending by category."
            />
          </div>
        )}

        <p className="mt-4 text-[11px] leading-5 text-slate-400">
          Progress turns amber at 70%, red at 80%, and bright red when a limit
          is exceeded.
        </p>
      </section>
    </div>
  )
}
