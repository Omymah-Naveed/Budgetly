import { useDeferredValue, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  ChevronDown,
  Download,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  X,
} from 'lucide-react'
import { CATEGORY_KEYS, CATEGORIES } from '../../data/mockData'
import { getTotals } from '../../utils/finance'
import { formatCurrency, pluralize } from '../../utils/format'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import TransactionTable from './TransactionTable'

const TYPE_FILTERS = [
  { id: 'all', label: 'All types' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expenses' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'amount-high', label: 'Highest amount' },
  { id: 'amount-low', label: 'Lowest amount' },
]

const selectClass =
  'h-10 w-full appearance-none rounded-xl border-0 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-all focus:ring-2 focus:ring-emerald-500/40'

export default function TransactionsView({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onExport,
}) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    const result = transactions.filter((transaction) => {
      const matchesQuery =
        !query ||
        transaction.title.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        (transaction.description || '').toLowerCase().includes(query)

      const matchesCategory =
        category === 'all' || transaction.category === category
      const matchesType = type === 'all' || transaction.type === type

      return matchesQuery && matchesCategory && matchesType
    })

    return [...result].sort((a, b) => {
      if (sort === 'oldest') return a.date.localeCompare(b.date)
      if (sort === 'amount-high') return b.amount - a.amount
      if (sort === 'amount-low') return a.amount - b.amount
      if (a.date === b.date) return b.id.localeCompare(a.id)
      return b.date.localeCompare(a.date)
    })
  }, [transactions, deferredSearch, category, type, sort])

  const filteredTotals = useMemo(() => getTotals(filtered), [filtered])
  const hasFilters =
    search.trim() !== '' || category !== 'all' || type !== 'all'

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setType('all')
    setSort('newest')
  }

  return (
    <div className="space-y-6">
      <section className="card-surface overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Transaction history
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
                {transactions.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Every income and expense in one searchable place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onExport}
              disabled={transactions.length === 0}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button onClick={() => onAddTransaction('expense')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add new
            </Button>
          </div>
        </div>

        <div className="bg-white px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto_180px]">
            <div className="relative">
              <label htmlFor="transaction-search" className="sr-only">
                Search transactions
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="transaction-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions, category, notes..."
                className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-10 text-sm text-slate-700 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={selectClass}
              >
                <option value="all">All categories</option>
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORIES[key].label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <div className="flex h-10 rounded-xl bg-slate-100 p-1">
              {TYPE_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setType(filter.id)}
                  aria-pressed={type === filter.id}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 text-[11px] font-bold transition-all',
                    type === filter.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <label htmlFor="sort-filter" className="sr-only">
                Sort transactions
              </label>
              <ArrowDownUp
                className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                id="sort-filter"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className={`${selectClass} pl-9`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-slate-400" aria-live="polite">
              Showing {pluralize(filtered.length, 'transaction')} of{' '}
              {transactions.length}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {filtered.length > 0 ? (
          <TransactionTable
            transactions={filtered}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        ) : (
          <div className="border-t border-slate-100">
            <EmptyState
              icon={SearchX}
              title="No transactions found"
              description="Try a different search term or clear your filters to see more results."
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Clear all filters
                  </Button>
                ) : (
                  <Button onClick={() => onAddTransaction('expense')}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add your first transaction
                  </Button>
                )
              }
            />
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium text-slate-500">
              Results total:{' '}
              <span className="font-bold text-emerald-600">
                {formatCurrency(filteredTotals.income)}
              </span>{' '}
              income ·{' '}
              <span className="font-bold text-rose-600">
                {formatCurrency(filteredTotals.expenses)}
              </span>{' '}
              expenses
            </span>
            <span className="font-semibold text-slate-500">
              Net:{' '}
              <span
                className={cn(
                  'font-bold tabular-nums',
                  filteredTotals.balance >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600',
                )}
              >
                {formatCurrency(filteredTotals.balance)}
              </span>
            </span>
          </div>
        ) : null}
      </section>
    </div>
  )
}
