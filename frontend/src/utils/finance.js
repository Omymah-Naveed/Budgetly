import {
  getMonthKey,
  getMonthKeyFromDateKey,
  getRecentMonths,
  toDateKey,
} from './date'

export const getTotals = (transactions) =>
  transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount
      } else {
        totals.expenses += transaction.amount
      }

      totals.balance = totals.income - totals.expenses
      totals.count += 1
      return totals
    },
    { income: 0, expenses: 0, balance: 0, count: 0 },
  )

export const getMonthTotals = (transactions, monthKey) =>
  getTotals(
    transactions.filter(
      (transaction) => getMonthKeyFromDateKey(transaction.date) === monthKey,
    ),
  )

export const getCategoryBreakdown = (transactions, monthKey = null) => {
  const totals = new Map()

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense') return
    if (monthKey && getMonthKeyFromDateKey(transaction.date) !== monthKey) {
      return
    }

    totals.set(
      transaction.category,
      (totals.get(transaction.category) || 0) + transaction.amount,
    )
  })

  return [...totals.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
}

export const getPercentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  return ((current - previous) / Math.abs(previous)) * 100
}

export const getSavingsRate = (income, expenses) => {
  if (income <= 0) return 0
  return ((income - expenses) / income) * 100
}

export const buildMonthlySeries = (transactions, months) => {
  const grouped = new Map(
    months.map((month) => [
      month.key,
      { income: 0, expenses: 0, balance: 0 },
    ]),
  )

  transactions.forEach((transaction) => {
    const key = getMonthKeyFromDateKey(transaction.date)
    const bucket = grouped.get(key)

    if (!bucket) return

    if (transaction.type === 'income') {
      bucket.income += transaction.amount
    } else {
      bucket.expenses += transaction.amount
    }

    bucket.balance = bucket.income - bucket.expenses
  })

  return months.map((month) => ({
    ...month,
    ...grouped.get(month.key),
  }))
}

export const getBudgetTone = (ratio) => {
  if (ratio > 1) return 'over'
  if (ratio >= 0.8) return 'danger'
  if (ratio >= 0.7) return 'warning'
  return 'safe'
}

export const getBudgetLabel = (tone) => {
  if (tone === 'over') return 'Over budget'
  if (tone === 'danger') return 'Near limit'
  if (tone === 'warning') return 'Watch limit'
  return 'On track'
}

export const getBudgetUsage = (budgets, transactions, monthKey) => {
  const monthlyExpenses = transactions.filter(
    (transaction) =>
      transaction.type === 'expense' &&
      getMonthKeyFromDateKey(transaction.date) === monthKey,
  )

  return budgets.map((budget) => {
    const spent = monthlyExpenses
      .filter((transaction) => transaction.category === budget.category)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const ratio = budget.limit > 0 ? spent / budget.limit : 0

    return {
      ...budget,
      spent,
      ratio,
      percent: Math.round(ratio * 100),
      remaining: budget.limit - spent,
      tone: getBudgetTone(ratio),
    }
  })
}

export const getOverallBudget = (usage) =>
  usage.reduce(
    (summary, budget) => {
      summary.limit += budget.limit
      summary.spent += budget.spent
      return summary
    },
    { limit: 0, spent: 0 },
  )

export const getAnalyticsWindow = (period, reference = new Date()) => {
  let monthCount = 6

  if (period === 'month') monthCount = 1
  if (period === 'quarter') monthCount = 3
  if (period === 'half') monthCount = 6
  if (period === 'year') monthCount = reference.getMonth() + 1

  const months = getRecentMonths(monthCount, reference)
  const startKey = `${months[0].key}-01`
  const endDate = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    0,
  )
  const endKey = toDateKey(endDate)

  return {
    months,
    startKey,
    endKey,
    monthCount,
    label:
      period === 'month'
        ? 'This month'
        : period === 'year'
          ? 'This year'
          : `Last ${monthCount} months`,
  }
}

export const getCurrentMonthKey = () => getMonthKey(new Date())
