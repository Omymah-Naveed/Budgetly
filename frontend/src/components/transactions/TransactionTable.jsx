import { Pencil, ReceiptText, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'
import {
  formatSignedCurrency,
  formatTransactionDate,
} from '../../utils/format'
import CategoryBadge from '../ui/CategoryBadge'

function TypeBadge({ type }) {
  const isIncome = type === 'income'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        isIncome
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-rose-50 text-rose-700 ring-rose-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isIncome ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      {isIncome ? 'Income' : 'Expense'}
    </span>
  )
}

function RowActions({ transaction, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        aria-label={`Edit ${transaction.title}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        aria-label={`Delete ${transaction.title}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export default function TransactionTable({ transactions, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Date
              </th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Transaction
              </th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Type
              </th>
              <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const meta = CATEGORIES[transaction.category]
              const Icon = meta?.icon || ReceiptText
              const isIncome = transaction.type === 'income'

              return (
                <tr
                  key={transaction.id}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-6 py-3.5 text-xs font-medium text-slate-500">
                    {formatTransactionDate(transaction.date)}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${meta?.iconClass || 'bg-slate-50 text-slate-500 ring-slate-100'}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 max-w-[260px]">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {transaction.title}
                        </p>
                        {transaction.description ? (
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {transaction.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <CategoryBadge category={transaction.category} />
                  </td>
                  <td className="px-3 py-3.5">
                    <TypeBadge type={transaction.type} />
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3.5 text-right text-sm font-bold tabular-nums ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatSignedCurrency(
                      transaction.amount,
                      transaction.type,
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <RowActions
                      transaction={transaction}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {transactions.map((transaction) => {
          const meta = CATEGORIES[transaction.category]
          const Icon = meta?.icon || ReceiptText
          const isIncome = transaction.type === 'income'

          return (
            <li key={transaction.id} className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${meta?.iconClass || 'bg-slate-50 text-slate-500 ring-slate-100'}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {transaction.title}
                    </p>
                    <span
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatSignedCurrency(
                        transaction.amount,
                        transaction.type,
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatTransactionDate(transaction.date)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={transaction.category} />
                      <TypeBadge type={transaction.type} />
                    </div>
                    <RowActions
                      transaction={transaction}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
