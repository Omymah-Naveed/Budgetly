import { ArrowRight, Target } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'
import { getBudgetLabel, getBudgetTone } from '../../utils/finance'
import { formatCurrencyWhole } from '../../utils/format'
import ProgressBar from '../ui/ProgressBar'

export default function BudgetSnapshot({ usage, overall, onManage }) {
  const ratio = overall.limit > 0 ? overall.spent / overall.limit : 0
  const tone = getBudgetTone(ratio)
  const remaining = overall.limit - overall.spent
  const onTrack = usage.filter((budget) => budget.tone === 'safe').length
  const focus = [...usage].sort((a, b) => b.ratio - a.ratio).slice(0, 3)

  return (
    <section className="card-surface flex flex-col rounded-2xl">
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Budget health</h2>
          <p className="mt-1 text-xs text-slate-500">
            {onTrack} of {usage.length} categories on track
          </p>
        </div>
        <button
          type="button"
          onClick={onManage}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          Manage
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                <Target className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">
                  Monthly limit
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrencyWhole(overall.spent)}
                  <span className="ml-1 text-[11px] font-medium text-slate-400">
                    / {formatCurrencyWhole(overall.limit)}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold tabular-nums text-slate-900">
                {Math.round(ratio * 100)}%
              </p>
              <p className="text-[10px] font-semibold text-slate-400">
                {getBudgetLabel(tone)}
              </p>
            </div>
          </div>
          <ProgressBar
            value={ratio * 100}
            tone={tone}
            trackClassName="mt-3 h-1.5 bg-slate-200/70"
          />
          <p className="mt-2.5 text-[11px] text-slate-500">
            {remaining >= 0 ? (
              <>
                <span className="font-bold text-slate-700">
                  {formatCurrencyWhole(remaining)}
                </span>{' '}
                remaining this month
              </>
            ) : (
              <>
                <span className="font-bold text-rose-600">
                  {formatCurrencyWhole(Math.abs(remaining))}
                </span>{' '}
                over your monthly limit
              </>
            )}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {focus.map((budget) => {
            const meta = CATEGORIES[budget.category]

            return (
              <div key={budget.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-700">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${meta?.dotClass || 'bg-slate-400'}`}
                    />
                    <span className="truncate">{budget.category}</span>
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">
                    {formatCurrencyWhole(budget.spent)}
                    <span className="text-slate-300"> / </span>
                    {formatCurrencyWhole(budget.limit)}
                  </span>
                </div>
                <ProgressBar
                  value={budget.ratio * 100}
                  tone={budget.tone}
                  trackClassName="mt-1.5 h-1.5"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
