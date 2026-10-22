import { useState } from 'react'
import {
  Coins,
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  LockKeyhole,
  Moon,
  SlidersHorizontal,
  Sun,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { CURRENCIES, getCurrencySymbol } from '../../utils/currencies'
import { cn } from '../../utils/cn'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Feedback from './Feedback'
import { fieldClass, labelClass } from './formStyles'

const TABS = [
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'security', label: 'Security', icon: LockKeyhole },
]

export default function SettingsModal({
  user,
  onClose,
  onSavePreferences,
  onChangePassword,
  onExportData,
  transactionCount = 0,
}) {
  const { theme, setTheme } = useAuth()
  const [activeTab, setActiveTab] = useState('preferences')
  const [currency, setCurrency] = useState(user.currency)
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [preferencesError, setPreferencesError] = useState('')
  const [securityError, setSecurityError] = useState('')
  const [preferencesMessage, setPreferencesMessage] = useState('')
  const [securityMessage, setSecurityMessage] = useState('')
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const currencyPreview = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(1234.5)

  const updateSecurityField = (field) => (event) => {
    setSecurity((current) => ({ ...current, [field]: event.target.value }))
    setSecurityError('')
    setSecurityMessage('')
  }

  const handlePreferencesSubmit = async (event) => {
    event.preventDefault()
    setIsSavingPreferences(true)
    setPreferencesError('')
    setPreferencesMessage('')

    try {
      await onSavePreferences({ currency })
      setPreferencesMessage('Currency preference saved.')
    } catch (error) {
      setPreferencesError(
        error?.message || 'Could not save your preference. Please try again.',
      )
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    if (!security.currentPassword || !security.newPassword) {
      setSecurityError('Fill in your current and new password.')
      return
    }

    if (security.newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.')
      return
    }

    if (security.newPassword !== security.confirmPassword) {
      setSecurityError('New passwords do not match.')
      return
    }

    setIsSavingPassword(true)
    setSecurityError('')
    setSecurityMessage('')

    try {
      await onChangePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      })
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSecurityMessage('Password updated successfully.')
    } catch (error) {
      setSecurityError(
        error?.message || 'Could not update your password. Please try again.',
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Settings"
      description="Manage app preferences and your account security."
      size="md"
    >
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all',
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'preferences' ? (
        <>
          <form onSubmit={handlePreferencesSubmit} noValidate className="mt-5">
          <div>
            <label htmlFor="settings-currency" className={labelClass}>
              Display currency
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {getCurrencySymbol(currency)}
              </span>
              <select
                id="settings-currency"
                data-autofocus
                value={currency}
                onChange={(event) => {
                  setCurrency(event.target.value)
                  setPreferencesError('')
                  setPreferencesMessage('')
                }}
                className={cn(fieldClass, 'appearance-none pl-9 pr-10')}
              >
                {CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} — {option.label}
                  </option>
                ))}
              </select>
              <Coins
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Preview:{' '}
              <span className="font-semibold text-slate-600">
                {currencyPreview}
              </span>
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-800 ring-1 ring-amber-100">
            Changing currency only changes how amounts are displayed. Existing
            amounts are not converted.
          </div>

          <Feedback
            error={preferencesError}
            message={preferencesMessage}
          />

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
            <Button type="submit" disabled={isSavingPreferences}>
              {isSavingPreferences ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save preference'
              )}
            </Button>
          </div>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-600">Appearance</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Choose how Budgetly looks on this device.
            </p>
            <div
              role="group"
              aria-label="Theme"
              className="mt-3 grid grid-cols-2 gap-2"
            >
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
              ].map((option) => {
                const Icon = option.icon
                const isActive = theme === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      'flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/40'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Saved automatically for this browser.
            </p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2">
              <Download
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold text-slate-600">
                Export all data
              </p>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Download all {transactionCount}{' '}
              {transactionCount === 1 ? 'transaction' : 'transactions'} from
              your workspace.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={transactionCount === 0}
                onClick={() => onExportData('csv')}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                Export CSV
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={transactionCount === 0}
                onClick={() => onExportData('json')}
              >
                <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
                Export JSON
              </Button>
            </div>
          </div>
        </>
      ) : null}

      {activeTab === 'security' ? (
        <form onSubmit={handlePasswordSubmit} noValidate className="mt-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="settings-old-password" className={labelClass}>
                Current password
              </label>
              <input
                id="settings-old-password"
                data-autofocus
                type="password"
                autoComplete="current-password"
                value={security.currentPassword}
                onChange={updateSecurityField('currentPassword')}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="settings-new-password" className={labelClass}>
                New password
              </label>
              <input
                id="settings-new-password"
                type="password"
                autoComplete="new-password"
                value={security.newPassword}
                onChange={updateSecurityField('newPassword')}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="settings-confirm-password" className={labelClass}>
                Confirm new password
              </label>
              <input
                id="settings-confirm-password"
                type="password"
                autoComplete="new-password"
                value={security.confirmPassword}
                onChange={updateSecurityField('confirmPassword')}
                className={fieldClass}
              />
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            Use at least 6 characters. You will stay signed in after changing
            your password.
          </p>

          <Feedback error={securityError} message={securityMessage} />

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  )
}
