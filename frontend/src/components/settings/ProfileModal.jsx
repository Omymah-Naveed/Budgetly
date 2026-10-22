import { useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { getCurrencyMeta } from '../../utils/currencies'
import { getInitials } from '../../utils/format'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Feedback from './Feedback'
import { fieldClass, labelClass } from './formStyles'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ProfileModal({
  user,
  onClose,
  onSaveProfile,
  onDeleteAccount,
}) {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDangerOpen, setIsDangerOpen] = useState(false)
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmation: '',
  })
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const currencyMeta = getCurrencyMeta(user.currency)
  const memberSinceDate = user.createdAt ? new Date(user.createdAt) : null
  const memberSince =
    memberSinceDate && !Number.isNaN(memberSinceDate.getTime())
      ? memberSinceDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : '—'
  const emailChanged =
    profile.email.trim().toLowerCase() !== user.email.toLowerCase()

  const updateField = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }))
    setError('')
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = profile.name.trim()
    const email = profile.email.trim().toLowerCase()

    if (!name) {
      setError('Name is required.')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address.')
      return
    }

    if (emailChanged && !profile.currentPassword) {
      setError('Enter your current password to change your email.')
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      await onSaveProfile({
        name,
        email,
        currency: user.currency,
        ...(emailChanged
          ? { currentPassword: profile.currentPassword }
          : {}),
      })
      setProfile((current) => ({
        ...current,
        name,
        email,
        currentPassword: '',
      }))
      setMessage('Profile updated successfully.')
    } catch (saveFailure) {
      setError(
        saveFailure?.message ||
          'Could not update your profile. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSubmit = async (event) => {
    event.preventDefault()

    if (!deleteForm.password) {
      setDeleteError('Enter your current password.')
      return
    }

    if (deleteForm.confirmation !== 'DELETE') {
      setDeleteError('Type DELETE exactly to confirm.')
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      await onDeleteAccount({
        password: deleteForm.password,
        confirmation: deleteForm.confirmation,
      })
    } catch (deleteFailure) {
      setDeleteError(
        deleteFailure?.message ||
          'Could not delete your account. Please try again.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="My profile"
      description="Update your personal information and email address."
      size="md"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-bold text-white shadow-sm">
          {getInitials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {user.name}
          </p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Currency
          </p>
          <p className="text-sm font-bold text-slate-700">
            {currencyMeta.code}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Member since
            </p>
            <p className="truncate text-xs font-bold text-slate-700">
              {memberSince}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Account type
            </p>
            <p className="truncate text-xs font-bold text-slate-700">
              Personal Account
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className={labelClass}>
              Full name
            </label>
            <input
              id="profile-name"
              data-autofocus
              type="text"
              autoComplete="name"
              value={profile.name}
              onChange={updateField('name')}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className={labelClass}>
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={updateField('email')}
              className={fieldClass}
            />
          </div>

          {emailChanged ? (
            <div>
              <label htmlFor="profile-current-password" className={labelClass}>
                Current password
              </label>
              <input
                id="profile-current-password"
                type="password"
                autoComplete="current-password"
                value={profile.currentPassword}
                onChange={updateField('currentPassword')}
                placeholder="Required to change your email"
                className={fieldClass}
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Email changes are protected by your current password.
              </p>
            </div>
          ) : null}
        </div>

        <Feedback error={error} message={message} />

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              'Save profile'
            )}
          </Button>
        </div>
      </form>

      <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 ring-1 ring-rose-200">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-rose-900">Danger zone</h3>
            <p className="mt-1 text-[11px] leading-5 text-rose-700/80">
              Permanently delete your account, transactions, and budget history.
              This cannot be undone.
            </p>
            {!isDangerOpen ? (
              <Button
                variant="dangerSoft"
                size="sm"
                className="mt-3"
                onClick={() => setIsDangerOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete account
              </Button>
            ) : null}
          </div>
        </div>

        {isDangerOpen ? (
          <form
            onSubmit={handleDeleteSubmit}
            noValidate
            className="mt-4 border-t border-rose-200/70 pt-4"
          >
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="delete-account-password"
                  className="mb-1.5 block text-xs font-semibold text-rose-900"
                >
                  Current password
                </label>
                <input
                  id="delete-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={deleteForm.password}
                  onChange={(event) => {
                    setDeleteForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                    setDeleteError('')
                  }}
                  placeholder="Confirm your password"
                  className="h-10 w-full rounded-xl border-0 bg-white px-3.5 text-sm text-slate-800 ring-1 ring-inset ring-rose-200 transition focus:ring-2 focus:ring-rose-400/40"
                />
              </div>

              <div>
                <label
                  htmlFor="delete-account-confirmation"
                  className="mb-1.5 block text-xs font-semibold text-rose-900"
                >
                  Type <span className="font-mono font-extrabold">DELETE</span>{' '}
                  to confirm
                </label>
                <input
                  id="delete-account-confirmation"
                  type="text"
                  autoComplete="off"
                  value={deleteForm.confirmation}
                  onChange={(event) => {
                    setDeleteForm((current) => ({
                      ...current,
                      confirmation: event.target.value,
                    }))
                    setDeleteError('')
                  }}
                  placeholder="DELETE"
                  className="h-10 w-full rounded-xl border-0 bg-white px-3.5 font-mono text-sm uppercase tracking-wider text-slate-800 ring-1 ring-inset ring-rose-200 transition focus:ring-2 focus:ring-rose-400/40"
                />
              </div>
            </div>

            {deleteError ? (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-white px-3 py-2.5 text-[11px] font-medium leading-5 text-rose-700 ring-1 ring-rose-200"
              >
                {deleteError}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsDangerOpen(false)
                  setDeleteForm({ password: '', confirmation: '' })
                  setDeleteError('')
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={
                  isDeleting ||
                  !deleteForm.password ||
                  deleteForm.confirmation !== 'DELETE'
                }
              >
                {isDeleting ? (
                  <>
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete permanently
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </Modal>
  )
}
