import { ArrowRight, Pencil, ReceiptText, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'
import {
  formatShortDate,
  formatSignedCurrency,
} from '../../utils/format'
import EmptyState from '../ui/EmptyState'

export default function RecentTransactions({
  transactions,
  onViewAll,
  onEdit,
  onDelete,
}) {
  return (
    <section className="card-surface rounded-2xl">
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Recent activity</h2>
          <p className="mt-1 text-xs text-slate-500">
            Your latest money movements
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          compact
          icon={ReceiptText}
          title="No activity yet"
          description="Add your first transaction to start tracking your money."
        />
      ) : (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {transactions.map((transaction) => {
            const meta = CATEGORIES[transaction.category]
            const Icon = meta?.icon || ReceiptText
            const isIncome = transaction.type === 'income'

            return (
              <li
                key={transaction.id}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70 sm:px-6"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${meta?.iconClass || 'bg-slate-50 text-slate-500 ring-slate-100'}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {transaction.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {transaction.category} ·{' '}
                    {formatShortDate(transaction.date)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                      aria-label={`Edit ${transaction.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-emerald-600 hover:shadow-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(transaction)}
                      aria-label={`Delete ${transaction.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-rose-600 hover:shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <span
                    className={`w-24 text-right text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}
                  >
                    {formatSignedCurrency(transaction.amount, transaction.type)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
