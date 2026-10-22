import api from './api'
import { normalizeCurrency } from '../utils/currencies'

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  currency: normalizeCurrency(user.currency),
  createdAt: user.createdAt ?? null,
})

export const fetchMe = async () => {
  const { data } = await api.get('/auth/me')

  return normalizeUser(data.user)
}

export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/profile', payload)

  return normalizeUser(data.user)
}

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/auth/password', {
    currentPassword,
    newPassword,
  })

  return data
}

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email })

  return data
}

export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await api.post(
    `/auth/reset-password/${encodeURIComponent(token)}`,
    { newPassword },
  )

  return data
}

export const deleteAccount = async ({ password, confirmation }) => {
  const { data } = await api.delete('/auth/account', {
    data: { password, confirmation },
  })

  return data
}
