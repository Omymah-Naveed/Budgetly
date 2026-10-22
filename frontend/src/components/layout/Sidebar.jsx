import {
  ArrowLeftRight,
  ChartPie,
  LayoutDashboard,
  Wallet,
  WalletCards,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatCurrencyWhole } from '../../utils/format'
import { getBudgetLabel } from '../../utils/finance'
import ProgressBar from '../ui/ProgressBar'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: WalletCards },
  { id: 'analytics', label: 'Analytics', icon: ChartPie },
]

function SidebarContent({
  activeView,
  onNavigate,
  transactionCount,
  budgetSummary,
  onClose,
}) {
  const remaining = budgetSummary.limit - budgetSummary.spent
  const tone = budgetSummary.tone

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl"
      />

      <div className="relative flex items-center justify-between px-5 pb-7 pt-6">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 rounded-xl text-left"
          aria-label="Go to dashboard"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Wallet className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight text-white">
              Budgetly
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Money, simplified
            </span>
          </span>
        </button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav
        className="scrollbar-thin relative flex-1 overflow-y-auto px-3"
        aria-label="Main navigation"
      >
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Workspace
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-white/[0.06]'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
                  )}
                >
                  {isActive ? (
                    <span className="absolute left-0 h-5 w-1 rounded-r-full bg-emerald-400" />
                  ) : null}
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] transition-colors',
                      isActive
                        ? 'text-emerald-400'
                        : 'text-slate-500 group-hover:text-slate-300',
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'transactions' ? (
                    <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-400">
                      {transactionCount}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Monthly budget
            </p>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              {budgetSummary.percent}%
            </span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-white">
            {formatCurrencyWhole(budgetSummary.spent)}
            <span className="ml-1 text-xs font-medium text-slate-500">
              of {formatCurrencyWhole(budgetSummary.limit)}
            </span>
          </p>
          <ProgressBar
            value={budgetSummary.percent}
            tone={tone}
            trackClassName="mt-3 bg-white/10"
          />
          <p className="mt-2.5 text-[11px] leading-4 text-slate-500">
            {remaining >= 0 ? (
              <>
                <span className="font-semibold text-slate-300">
                  {formatCurrencyWhole(remaining)}
                </span>{' '}
                left · {getBudgetLabel(tone)}
              </>
            ) : (
              <>
                <span className="font-semibold text-rose-400">
                  {formatCurrencyWhole(Math.abs(remaining))}
                </span>{' '}
                over budget
              </>
            )}
          </p>
        </div>
      </nav>

      <div className="relative border-t border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>Budgetly v1.0</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            API connected
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({
  activeView,
  onNavigate,
  isOpen,
  onClose,
  transactionCount,
  budgetSummary,
}) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <SidebarContent
          activeView={activeView}
          onNavigate={onNavigate}
          transactionCount={transactionCount}
          budgetSummary={budgetSummary}
        />
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 animate-fade-in bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(18rem,86vw)] animate-slide-in-left shadow-2xl shadow-slate-950/40">
            <SidebarContent
              activeView={activeView}
              onNavigate={onNavigate}
              transactionCount={transactionCount}
              budgetSummary={budgetSummary}
              onClose={onClose}
            />
          </aside>
        </div>
      ) : null}
    </>
  )
}
