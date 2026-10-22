import { ChartPie, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { getMonthKey, addMonths, getMonthLabel } from '../../utils/date'
import {
  getBudgetUsage,
  getCategoryBreakdown,
  getMonthTotals,
  getOverallBudget,
  getPercentageChange,
  getSavingsRate,
  getTotals,
} from '../../utils/finance'
import { formatCurrency, formatPercent } from '../../utils/format'
import BudgetSnapshot from './BudgetSnapshot'
import CashFlowChart from './CashFlowChart'
import ExpenseDonut from './ExpenseDonut'
import RecentTransactions from './RecentTransactions'
import StatCard from './StatCard'
import EmptyState from '../ui/EmptyState'

export default function DashboardView({
  transactions,
  budgets,
  totalLimit,
  onNavigate,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const currentMonthKey = getMonthKey()
  const previousMonthKey = getMonthKey(addMonths(new Date(), -1))

  const {
    totalBalance,
    current,
    budgetUsage,
    overallBudget,
    breakdown,
    recent,
    balanceChange,
    incomeChange,
    expenseChange,
    savingsRate,
    previousSavingsRate,
  } = useMemo(() => {
    const totals = getTotals(transactions)
    const currentTotals = getMonthTotals(transactions, currentMonthKey)
    const previousTotals = getMonthTotals(transactions, previousMonthKey)
    const usage = getBudgetUsage(budgets, transactions, currentMonthKey)
    const categoryOverall = getOverallBudget(usage)
    const currentSavings = getSavingsRate(
      currentTotals.income,
      currentTotals.expenses,
    )
    const priorSavings = getSavingsRate(
      previousTotals.income,
      previousTotals.expenses,
    )

    return {
      totalBalance: totals.balance,
      current: currentTotals,
      budgetUsage: usage,
      overallBudget: {
        limit: totalLimit > 0 ? totalLimit : categoryOverall.limit,
        spent: currentTotals.expenses,
      },
      breakdown: getCategoryBreakdown(transactions, currentMonthKey),
      recent: [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
      balanceChange: getPercentageChange(
        currentTotals.balance,
        previousTotals.balance,
      ),
      incomeChange: getPercentageChange(
        currentTotals.income,
        previousTotals.income,
      ),
      expenseChange: getPercentageChange(
        currentTotals.expenses,
        previousTotals.expenses,
      ),
      savingsRate: currentSavings,
      previousSavingsRate: priorSavings,
    }
  }, [transactions, budgets, totalLimit, currentMonthKey, previousMonthKey])

  const savingsChange = getPercentageChange(savingsRate, previousSavingsRate)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Financial overview
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
            This month at a glance
          </h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
          {getMonthLabel(currentMonthKey, 'long')}
        </span>
      </div>

      <section
        aria-label="Summary statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4"
      >
        <StatCard
          title="Total balance"
          value={formatCurrency(totalBalance)}
          change={balanceChange}
          changeLabel="net vs last month"
          icon={Wallet}
          dark
          changeTone={balanceChange >= 0 ? 'good' : 'bad'}
        />
        <StatCard
          title="Total income"
          value={formatCurrency(current.income)}
          change={incomeChange}
          icon={TrendingUp}
          tone="emerald"
          changeTone={incomeChange >= 0 ? 'good' : 'bad'}
        />
        <StatCard
          title="Total expenses"
          value={formatCurrency(current.expenses)}
          change={expenseChange}
          icon={TrendingDown}
          tone="rose"
          changeTone={expenseChange <= 0 ? 'good' : 'bad'}
        />
        <StatCard
          title="Savings rate"
          value={formatPercent(savingsRate)}
          change={savingsChange}
          changeLabel="vs last month"
          icon={PiggyBank}
          tone="violet"
          changeTone={savingsRate >= previousSavingsRate ? 'good' : 'bad'}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <CashFlowChart transactions={transactions} />
        </div>
        {breakdown.length > 0 ? (
          <ExpenseDonut data={breakdown} monthKey={currentMonthKey} />
        ) : (
          <section className="card-surface flex items-center justify-center rounded-2xl">
            <EmptyState
              compact
              icon={ChartPie}
              title="No spending yet"
              description="Expense categories will appear here once you add transactions."
            />
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentTransactions
            transactions={recent}
            onViewAll={() => onNavigate('transactions')}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        </div>
        <BudgetSnapshot
          usage={budgetUsage}
          overall={overallBudget}
          onManage={() => onNavigate('budgets')}
        />
      </div>
    </div>
  )
}
