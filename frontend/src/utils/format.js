import { DEFAULT_CURRENCY, normalizeCurrency } from './currencies'
import { parseDateKey } from './date'

const formatterCache = new Map()
let activeCurrency = DEFAULT_CURRENCY

const getFormatters = (code) => {
  const currency = normalizeCurrency(code)

  if (!formatterCache.has(currency)) {
    formatterCache.set(currency, {
      currency: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      whole: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      compact: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    })
  }

  return formatterCache.get(currency)
}

// AuthProvider calls this whenever the signed-in user's currency changes, so
// existing call sites keep using formatCurrency() without prop drilling.
export const setActiveCurrency = (code) => {
  activeCurrency = normalizeCurrency(code)
  return activeCurrency
}

export const getActiveCurrency = () => activeCurrency

export const formatCurrency = (value) =>
  getFormatters(activeCurrency).currency.format(Number(value) || 0)

export const formatCurrencyWhole = (value) =>
  getFormatters(activeCurrency).whole.format(Number(value) || 0)

export const formatCompactCurrency = (value) =>
  getFormatters(activeCurrency).compact.format(Number(value) || 0)

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const transactionDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const toDate = (dateKey) => parseDateKey(String(dateKey).slice(0, 10))

export const formatShortDate = (dateKey) =>
  shortDateFormatter.format(toDate(dateKey))

export const formatTransactionDate = (dateKey) =>
  transactionDateFormatter.format(toDate(dateKey))

export const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  return `${Number(value).toFixed(digits)}%`
}

export const formatSignedCurrency = (amount, type) =>
  `${type === 'income' ? '+' : '-'}${formatCurrency(amount)}`

export const getInitials = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`
