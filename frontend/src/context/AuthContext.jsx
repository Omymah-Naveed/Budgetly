import { useCallback, useEffect, useMemo, useState } from 'react'
import api, {
  getStoredItem,
  removeStoredItem,
  TOKEN_STORAGE_KEY,
  UNAUTHORIZED_EVENT,
  USER_STORAGE_KEY,
} from '../services/api'
import { normalizeCurrency } from '../utils/currencies'
import { setActiveCurrency } from '../utils/format'
import { AuthContext } from './useAuth'

export const THEME_STORAGE_KEY = 'budgetly-theme'
const LEGACY_THEME_STORAGE_KEY = 'finora-theme'

const getInitialTheme = () => {
  const stored =
    localStorage.getItem(THEME_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_THEME_STORAGE_KEY)

  if (stored === 'light' || stored === 'dark') {
    localStorage.setItem(THEME_STORAGE_KEY, stored)
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY)
    return stored
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const normalizeUser = (user) => ({
  ...user,
  currency: normalizeCurrency(user?.currency),
})

const readStoredSession = () => {
  const token = getStoredItem(TOKEN_STORAGE_KEY)
  const storedUser = getStoredItem(USER_STORAGE_KEY)

  if (!token || !storedUser) return null

  try {
    return { token, user: normalizeUser(JSON.parse(storedUser)) }
  } catch {
    removeStoredItem(TOKEN_STORAGE_KEY)
    removeStoredItem(USER_STORAGE_KEY)
    return null
  }
}

const persistSession = (session) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, session.token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user))
}

const clearStoredSession = () => {
  removeStoredItem(TOKEN_STORAGE_KEY)
  removeStoredItem(USER_STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)
  const [theme, setThemeState] = useState(getInitialTheme)

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password })
    const nextSession = { token: data.token, user: normalizeUser(data.user) }

    persistSession(nextSession)
    setSession(nextSession)

    return data
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    })
    const nextSession = { token: data.token, user: normalizeUser(data.user) }

    persistSession(nextSession)
    setSession(nextSession)

    return data
  }, [])

  const updateUser = useCallback((updates) => {
    setSession((current) => {
      if (!current) return current

      const nextSession = {
        ...current,
        user: normalizeUser({ ...current.user, ...updates }),
      }

      persistSession(nextSession)

      return nextSession
    })
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    const nextUser = normalizeUser(data.user)

    setSession((current) => {
      if (!current) return current

      const nextSession = { ...current, user: nextUser }
      persistSession(nextSession)

      return nextSession
    })

    return nextUser
  }, [])

  const setTheme = useCallback((nextTheme) => {
    const value = nextTheme === 'dark' ? 'dark' : 'light'

    localStorage.setItem(THEME_STORAGE_KEY, value)
    setThemeState(value)
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  // The API client fires this when a stored token is rejected (expired/revoked).
  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredSession()
      setSession(null)
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        (event.newValue === 'light' || event.newValue === 'dark')
      ) {
        setThemeState(event.newValue)
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Keep the formatter module in sync with the signed-in user's preference.
  setActiveCurrency(session?.user?.currency)

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      theme,
      login,
      register,
      updateUser,
      refreshUser,
      setTheme,
      logout,
    }),
    [
      session,
      theme,
      login,
      register,
      updateUser,
      refreshUser,
      setTheme,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
