import api from './api'

const normalizeBudget = (budget) => ({
  id: budget.id,
  year: Number(budget.year),
  month: Number(budget.month),
  category: budget.category,
  limit: Number(budget.limit),
})

const periodParams = (period) =>
  period
    ? { year: period.year, month: period.month }
    : undefined

export const fetchBudgets = async (period) => {
  const { data } = await api.get('/budgets', {
    params: periodParams(period),
  })

  return {
    period: data?.period,
    budgets: (data?.budgets ?? []).map(normalizeBudget),
    totalLimit: Number(data?.totalLimit) || 0,
  }
}

export const updateBudget = async (category, limit, period) => {
  const { data } = await api.put(
    `/budgets/${encodeURIComponent(category)}`,
    { limit },
    { params: periodParams(period) },
  )

  return normalizeBudget(data.budget)
}

export const updateTotalBudget = async (limit, period) => {
  const { data } = await api.put(
    '/budgets',
    { limit },
    { params: periodParams(period) },
  )

  return {
    period: data?.period,
    totalLimit: Number(data.totalLimit) || 0,
    budgets: (data.budgets ?? []).map(normalizeBudget),
  }
}
