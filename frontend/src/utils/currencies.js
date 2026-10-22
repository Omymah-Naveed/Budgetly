export const DEFAULT_CURRENCY = 'USD'

// Amounts are stored as plain numbers. Changing currency only changes the
// display; no exchange-rate conversion is applied.
export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: '₨' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
]

const CURRENCY_CODES = new Set(CURRENCIES.map((currency) => currency.code))

export const normalizeCurrency = (code) => {
  const value = typeof code === 'string' ? code.trim().toUpperCase() : ''

  return CURRENCY_CODES.has(value) ? value : DEFAULT_CURRENCY
}

export const getCurrencyMeta = (code) =>
  CURRENCIES.find((currency) => currency.code === normalizeCurrency(code)) ||
  CURRENCIES[0]

export const getCurrencySymbol = (code) => getCurrencyMeta(code).symbol
