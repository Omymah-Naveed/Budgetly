const getCsvHeaders = (currency) => [
  'ID',
  'Title',
  'Type',
  'Category',
  `Amount (${currency})`,
  'Date',
  'Description',
]

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? '')

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

const toCsvRow = (transaction) => [
  transaction.id,
  transaction.title,
  transaction.type === 'income' ? 'Income' : 'Expense',
  transaction.category,
  Number(transaction.amount).toFixed(2),
  transaction.date,
  transaction.description ?? '',
]

const downloadBlob = (content, type, extension) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `budgetly-transactions-${new Date()
    .toISOString()
    .slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const buildTransactionsCsv = (
  transactions,
  { currency = 'USD' } = {},
) =>
  `\uFEFF${[getCsvHeaders(currency), ...transactions.map(toCsvRow)]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n')}`

export const exportTransactionsToCsv = (transactions, options = {}) => {
  downloadBlob(
    buildTransactionsCsv(transactions, options),
    'text/csv;charset=utf-8;',
    'csv',
  )

  return transactions.length
}

export const buildTransactionsJson = (
  transactions,
  { currency = 'USD' } = {},
) =>
  JSON.stringify(
    {
      app: 'Budgetly',
      exportedAt: new Date().toISOString(),
      currency,
      transactionCount: transactions.length,
      transactions,
    },
    null,
    2,
  )

export const exportTransactionsToJson = (transactions, options = {}) => {
  downloadBlob(
    buildTransactionsJson(transactions, options),
    'application/json;charset=utf-8;',
    'json',
  )

  return transactions.length
}
