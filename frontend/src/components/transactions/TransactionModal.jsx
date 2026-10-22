import { useState } from 'react'
import {
  ChevronDown,
  Loader2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { CATEGORY_KEYS, CATEGORIES } from '../../data/mockData'
import { getCurrencySymbol } from '../../utils/currencies'
import { todayKey } from '../../utils/date'
import { cn } from '../../utils/cn'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const inputClass =
  'w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40'

const errorInputClass =
  'ring-rose-300 focus:ring-2 focus:ring-rose-400/40'

const TYPES = [
  { id: 'expense', label: 'Expense', icon: TrendingDown },
  { id: 'income', label: 'Income', icon: TrendingUp },
]

export default function TransactionModal({
  transaction,
  defaultType = 'expense',
  onClose,
  onSave,
}) {
  const isEditing = Boolean(transaction)
  const initialType = transaction?.type || defaultType

  const [form, setForm] = useState(() => ({
    type: initialType,
    title: transaction?.title || '',
    amount: transaction ? String(transaction.amount) : '',
    category:
      transaction?.category || (initialType === 'income' ? 'Salary' : 'Food'),
    date: transaction?.date || todayKey(),
    description: transaction?.description || '',
  }))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const setType = (type) => {
    setForm((current) => {
      let category = current.category

      if (type === 'income' && category !== 'Salary') {
        category = 'Salary'
      } else if (type === 'expense' && category === 'Salary') {
        category = 'Food'
      }

      return { ...current, type, category }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    const nextErrors = {}
    const numericAmount = Number(form.amount)

    if (!form.title.trim()) {
      nextErrors.title = 'Give this transaction a name.'
    }

    if (!form.amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Enter an amount greater than zero.'
    }

    if (!CATEGORY_KEYS.includes(form.category)) {
      nextErrors.category = 'Choose a valid category.'
    }

    if (!form.date) {
      nextErrors.date = 'Choose a date for this transaction.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await onSave({
        ...(transaction ? { id: transaction.id } : {}),
        type: form.type,
        title: form.title.trim(),
        amount: Math.round(numericAmount * 100) / 100,
        category: form.category,
        date: form.date,
        description: form.description.trim(),
      })
    } catch (error) {
      setSubmitError(
        error?.message ||
          'Could not save this transaction. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Edit transaction' : 'Add transaction'}
      description={
        isEditing
          ? 'Update the details and your dashboard will adjust instantly.'
          : 'Log a new income or expense and watch your budget update live.'
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          {TYPES.map((type) => {
            const Icon = type.icon
            const isActive = form.type === type.id

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setType(type.id)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all',
                  isActive
                    ? type.id === 'income'
                      ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                      : 'bg-white text-rose-700 shadow-sm ring-1 ring-rose-100'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {type.label}
              </button>
            )
          })}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="transaction-title"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Title
            </label>
            <input
              id="transaction-title"
              data-autofocus
              type="text"
              maxLength={80}
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="e.g. Weekly groceries"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={cn(inputClass, errors.title && errorInputClass)}
            />
            {errors.title ? (
              <p id="title-error" className="mt-1.5 text-[11px] font-medium text-rose-600">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="transaction-amount"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {getCurrencySymbol()}
                </span>
                <input
                  id="transaction-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(event) => updateField('amount', event.target.value)}
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.amount)}
                  aria-describedby={
                    errors.amount ? 'amount-error' : undefined
                  }
                  className={cn(
                    inputClass,
                    'pl-8 tabular-nums',
                    errors.amount && errorInputClass,
                  )}
                />
              </div>
              {errors.amount ? (
                <p
                  id="amount-error"
                  className="mt-1.5 text-[11px] font-medium text-rose-600"
                >
                  {errors.amount}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="transaction-date"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Date
              </label>
              <input
                id="transaction-date"
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'date-error' : undefined}
                className={cn(inputClass, errors.date && errorInputClass)}
              />
              {errors.date ? (
                <p
                  id="date-error"
                  className="mt-1.5 text-[11px] font-medium text-rose-600"
                >
                  {errors.date}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-category"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="transaction-category"
                value={form.category}
                onChange={(event) =>
                  updateField('category', event.target.value)
                }
                aria-invalid={Boolean(errors.category)}
                className={cn(
                  inputClass,
                  'appearance-none pr-10',
                  errors.category && errorInputClass,
                )}
              >
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORIES[key].label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
            {errors.category ? (
              <p className="mt-1.5 text-[11px] font-medium text-rose-600">
                {errors.category}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="transaction-description"
                className="text-xs font-semibold text-slate-600"
              >
                Description{' '}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <span className="text-[10px] tabular-nums text-slate-400">
                {form.description.length}/160
              </span>
            </div>
            <textarea
              id="transaction-description"
              rows={3}
              maxLength={160}
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Add a note about this transaction..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {submitError ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-rose-700"
          >
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : isEditing ? (
              'Save changes'
            ) : (
              `Add ${form.type}`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
