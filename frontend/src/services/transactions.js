import api from './api'
import { toDateKey } from '../utils/date'

// Convert the API document into the shape the UI components already use.
const normalizeTransaction = (transaction) => ({
  id: transaction.id,
  title: transaction.title,
  amount: Number(transaction.amount),
  type: transaction.type,
  category: transaction.category,
  date: typeof transaction.date === 'string'
    ? transaction.date.slice(0, 10)
    : toDateKey(new Date(transaction.date ?? Date.now())),
  description: transaction.description ?? '',
})

export const fetchTransactions = async () => {
  const { data } = await api.get('/transactions')

  return (data?.transactions ?? []).map(normalizeTransaction)
}

export const createTransaction = async (transaction) => {
  const { data } = await api.post('/transactions', transaction)

  return normalizeTransaction(data.transaction)
}

export const updateTransaction = async (id, transaction) => {
  const payload = {
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date,
    description: transaction.description,
  }
  const { data } = await api.put(`/transactions/${id}`, payload)

  return normalizeTransaction(data.transaction)
}

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/transactions/${id}`)

  return data
}
