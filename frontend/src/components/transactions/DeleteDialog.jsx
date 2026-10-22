import { useState } from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'
import {
  formatCurrency,
  formatTransactionDate,
} from '../../utils/format'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function DeleteDialog({ transaction, onClose, onConfirm }) {
  const meta = CATEGORIES[transaction.category]
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    setError('')

    try {
      await onConfirm()
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Could not delete this transaction. Please try again.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Delete transaction?"
      description="This action cannot be undone."
      size="sm"
    >
      <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-rose-100">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {transaction.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {meta?.label || transaction.category} ·{' '}
                  {formatTransactionDate(transaction.date)}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${
                  transaction.type === 'income'
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        Removing this entry will immediately update your balance, budgets, and
        analytics.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-rose-700"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isDeleting}
        >
          Keep transaction
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete permanently
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}
