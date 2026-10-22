import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  PiggyBank,
  ReceiptText,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'
import {
  buildMonthlySeries,
  getAnalyticsWindow,
  getCategoryBreakdown,
  getSavingsRate,
  getTotals,
} from '../../utils/finance'
import { isDateKeyInRange } from '../../utils/date'
import {
  formatCurrency,
  formatPercent,
  formatShortDate,
} from '../../utils/format'
import { cn } from '../../utils/cn'
import MonthlyBarChart from './MonthlyBarChart'
import CategoryBreakdown from './CategoryBreakdown'

const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: '3 months' },
  { id: 'half', label: '6 months' },
  { id: 'year', label: 'This year' },
]

const METRIC_TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
}

function MetricCard({ label, value, caption, icon: Icon, tone }) {
  return (
    <article className="card-surface rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.06] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-inset',
            METRIC_TONES[tone],
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 truncate text-xl font-extrabold tracking-tight text-slate-950 tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{caption}</p>
    </article>
  )
}

export default function AnalyticsView({ transactions }) {
  const [period, setPeriod] = useState('half')

  const {
    window,
    totals,
    savingsRate,
    breakdown,
    monthly,
    largestExpense,
    averageMonthly,
  } = useMemo(() => {
    const nextWindow = getAnalyticsWindow(period)
    const filtered = transactions.filter((transaction) =>
      isDateKeyInRange(
        transaction.date,
        nextWindow.startKey,
        nextWindow.endKey,
      ),
    )
    const nextTotals = getTotals(filtered)
    const expenses = filtered.filter(
      (transaction) => transaction.type === 'expense',
    )
    const largest = [...expenses].sort((a, b) => b.amount - a.amount)[0]

    return {
      window: nextWindow,
      totals: nextTotals,
      savingsRate: getSavingsRate(nextTotals.income, nextTotals.expenses),
      breakdown: getCategoryBreakdown(filtered),
      monthly: buildMonthlySeries(transactions, nextWindow.months),
      largestExpense: largest,
      averageMonthly: nextTotals.expenses / nextWindow.monthCount,
    }
  }, [transactions, period])

  const highestCategory = breakdown[0]
  const highestMeta = highestCategory
    ? CATEGORIES[highestCategory.category]
    : null
  const HighestIcon = highestMeta?.icon
  const highestShare =
    highestCategory && totals.expenses > 0
      ? (highestCategory.value / totals.expenses) * 100
      : 0
  const isNetPositive = totals.balance >= 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Performance window
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
            Spending analytics
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {window.label} · {window.monthCount}{' '}
            {window.monthCount === 1 ? 'month' : 'months'} of activity
          </p>
        </div>

        <div
          role="group"
          aria-label="Analytics period"
          className="no-scrollbar flex w-full overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-slate-200 lg:w-auto"
        >
          {PERIODS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPeriod(option.id)}
              aria-pressed={period === option.id}
              className={cn(
                'flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-[11px] font-bold transition-all lg:flex-none',
                period === option.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <section
        aria-label="Period metrics"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <MetricCard
          label="Total income"
          value={formatCurrency(totals.income)}
          caption={`${window.label} inflow`}
          icon={TrendingUp}
          tone="emerald"
        />
        <MetricCard
          label="Total expenses"
          value={formatCurrency(totals.expenses)}
          caption={`${window.label} outflow`}
          icon={TrendingDown}
          tone="rose"
        />
        <MetricCard
          label="Net savings"
          value={formatCurrency(totals.balance)}
          caption={`${formatPercent(savingsRate)} savings rate`}
          icon={Wallet}
          tone={isNetPositive ? 'emerald' : 'rose'}
        />
        <MetricCard
          label="Transactions"
          value={totals.count}
          caption={`${window.label} activity`}
          icon={ReceiptText}
          tone="sky"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <MonthlyBarChart data={monthly} periodLabel={window.label} />
        </div>
        <CategoryBreakdown
          data={breakdown}
          totalExpenses={totals.expenses}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Key insights</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="card-surface rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Top spending category
            </p>
            {highestCategory ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${highestMeta?.iconClass || 'bg-slate-50 text-slate-500 ring-slate-100'}`}
                  >
                    {HighestIcon ? (
                      <HighestIcon
                        className="h-4.5 w-4.5"
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {highestCategory.category}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {formatPercent(highestShare, 0)} of all expenses
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(highestCategory.value)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  across the selected period
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No expenses in this period.
              </p>
            )}
          </article>

          <article className="card-surface rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Largest single expense
            </p>
            {largestExpense ? (
              <>
                <div className="mt-3 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                    <ArrowDownRight
                      className="h-4.5 w-4.5"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {largestExpense.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {largestExpense.category} ·{' '}
                      {formatShortDate(largestExpense.date)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-extrabold tracking-tight text-rose-600 tabular-nums">
                  -{formatCurrency(largestExpense.amount)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  biggest hit to your wallet
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No expenses in this period.
              </p>
            )}
          </article>

          <article className="card-surface rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Average monthly spend
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <CalendarRange className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(averageMonthly)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  per month across {window.monthCount}{' '}
                  {window.monthCount === 1 ? 'month' : 'months'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
              <PiggyBank
                className="h-4 w-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <p className="text-[11px] leading-4 text-slate-500">
                You are keeping{' '}
                <span
                  className={cn(
                    'font-bold',
                    isNetPositive ? 'text-emerald-700' : 'text-rose-700',
                  )}
                >
                  {formatPercent(savingsRate)}
                </span>{' '}
                of the income you earned.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              {isNetPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
              )}
              Net {formatCurrency(totals.balance)} in this period
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
