import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'budgetly_token'
export const USER_STORAGE_KEY = 'budgetly_user'
export const UNAUTHORIZED_EVENT = 'budgetly:unauthorized'

const LEGACY_STORAGE_KEYS = {
  [TOKEN_STORAGE_KEY]: 'finora_token',
  [USER_STORAGE_KEY]: 'finora_user',
}

export const getStoredItem = (key) => {
  const current = localStorage.getItem(key)
  if (current !== null) return current

  const legacyKey = LEGACY_STORAGE_KEYS[key]
  const legacy = legacyKey ? localStorage.getItem(legacyKey) : null

  if (legacy !== null) {
    localStorage.setItem(key, legacy)
    localStorage.removeItem(legacyKey)
  }

  return legacy
}

export const removeStoredItem = (key) => {
  localStorage.removeItem(key)

  const legacyKey = LEGACY_STORAGE_KEYS[key]
  if (legacyKey) localStorage.removeItem(legacyKey)
}

const API_BASE_URL = 'https://budgetlybackend.vercel.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getStoredItem(TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Clear an expired/invalid session and notify AuthProvider.
// Login/register 401s are ignored so the forms can show their own error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const isAuthRequest =
      url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthRequest) {
      removeStoredItem(TOKEN_STORAGE_KEY)
      removeStoredItem(USER_STORAGE_KEY)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    return Promise.reject(error)
  },
)

export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the API. Please check your internet connection and try again.'
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}

export default api
