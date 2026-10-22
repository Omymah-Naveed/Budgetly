import { useState } from 'react'
import { Loader2, Target } from 'lucide-react'
import { getCurrencySymbol } from '../../utils/currencies'
import { getBudgetLabel, getBudgetTone } from '../../utils/finance'
import { formatCurrencyWhole } from '../../utils/format'
import { cn } from '../../utils/cn'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'

export default function TotalBudgetModal({
  currentLimit,
  spent,
  periodLabel,
  onClose,
  onSave,
}) {
  const [limit, setLimit] = useState(String(currentLimit))
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const numericLimit = Number(limit)
  const validLimit = Number.isFinite(numericLimit) && numericLimit > 0
  const ratio = validLimit ? spent / numericLimit : 0
  const tone = getBudgetTone(ratio)
  const remaining = validLimit ? numericLimit - spent : 0

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validLimit) {
      setError('Enter a monthly limit greater than zero.')
      return
    }

    if (isSaving) return

    setIsSaving(true)
    setSaveError('')

    try {
      await onSave(Math.round(numericLimit * 100) / 100)
    } catch (saveFailure) {
      setSaveError(
        saveFailure?.message ||
          'Could not save the budget limit. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Set monthly budget limit"
      description={`This is your overall spending plan for ${periodLabel || 'the month'}.`}
      size="sm"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 ring-1 ring-inset ring-slate-100">
            <Target className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500">
              Spent in {periodLabel || 'this month'}
            </p>
            <p className="text-lg font-extrabold tracking-tight text-slate-900 tabular-nums">
              {formatCurrencyWhole(spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Current limit
            </p>
            <p className="text-sm font-bold text-slate-700 tabular-nums">
              {formatCurrencyWhole(currentLimit)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="total-budget-limit"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Monthly budget limit
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
              {getCurrencySymbol()}
            </span>
            <input
              id="total-budget-limit"
              data-autofocus
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              value={limit}
              onChange={(event) => {
                setLimit(event.target.value)
                if (error) setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'total-budget-limit-error' : undefined}
              className={cn(
                'w-full rounded-xl border-0 bg-white py-3 pl-9 pr-4 text-lg font-bold text-slate-900 tabular-nums ring-1 ring-inset ring-slate-200 transition-all focus:ring-2 focus:ring-emerald-500/40',
                error && 'ring-rose-300 focus:ring-rose-400/40',
              )}
            />
          </div>
          {error ? (
            <p
              id="total-budget-limit-error"
              className="mt-1.5 text-[11px] font-medium text-rose-600"
            >
              {error}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-slate-400">
              Your category budgets will be scaled proportionally to match
              this total.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-600">
              New plan preview
            </span>
            <span className="text-xs font-bold tabular-nums text-slate-900">
              {validLimit ? Math.round(ratio * 100) : 0}% ·{' '}
              {getBudgetLabel(tone)}
            </span>
          </div>
          <ProgressBar
            value={ratio * 100}
            tone={tone}
            trackClassName="mt-3"
          />
          <p className="mt-2.5 text-[11px] text-slate-500">
            {validLimit ? (
              remaining >= 0 ? (
                <>
                  You would have{' '}
                  <span className="font-bold text-slate-700">
                    {formatCurrencyWhole(remaining)}
                  </span>{' '}
                  left for the rest of the month.
                </>
              ) : (
                <>
                  This limit is{' '}
                  <span className="font-bold text-rose-600">
                    {formatCurrencyWhole(Math.abs(remaining))}
                  </span>{' '}
                  below what you have already spent.
                </>
              )
            ) : (
              'Enter a limit to preview your monthly plan.'
            )}
          </p>
        </div>

        {saveError ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-[11px] font-medium leading-5 text-rose-700 ring-1 ring-rose-100"
          >
            {saveError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              'Save limit'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
