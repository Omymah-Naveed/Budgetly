const pad = (value) => String(value).padStart(2, '0')

export const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const todayKey = () => toDateKey(new Date())

export const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

export const getMonthKeyFromDateKey = (dateKey) => dateKey.slice(0, 7)

export const getMonthKeyFromParts = (year, month) =>
  `${year}-${pad(month)}`

export const getPeriodFromMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  return { year, month }
}

export const shiftMonthKey = (monthKey, amount) => {
  const [year, month] = monthKey.split('-').map(Number)
  return getMonthKey(addMonths(new Date(year, month - 1, 1), amount))
}

export const getMonthLabel = (monthKey, style = 'short') => {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return new Intl.DateTimeFormat('en-US', {
    month: style,
    year: style === 'long' ? 'numeric' : undefined,
  }).format(date)
}

export const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1)

export const getRecentMonths = (count, reference = new Date()) => {
  const months = []

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = addMonths(reference, -offset)
    const key = getMonthKey(date)
    months.push({
      key,
      date,
      short: getMonthLabel(key, 'short'),
      long: getMonthLabel(key, 'long'),
    })
  }

  return months
}

export const getDisplayDate = () =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

export const isDateKeyInMonth = (dateKey, monthKey) =>
  dateKey.slice(0, 7) === monthKey

export const isDateKeyInRange = (dateKey, startKey, endKey) =>
  dateKey >= startKey && dateKey <= endKey
