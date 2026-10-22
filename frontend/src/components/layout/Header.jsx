import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Settings,
  User,
} from 'lucide-react'
import { getDisplayDate } from '../../utils/date'
import { getInitials } from '../../utils/format'
import Button from '../ui/Button'

const PAGE_META = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'A clear view of your money, all in one place.',
  },
  transactions: {
    title: 'Transactions',
    subtitle: 'Search, filter, and manage every dollar.',
  },
  budgets: {
    title: 'Budget planner',
    subtitle: 'Set limits that keep your goals on track.',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Patterns, trends, and insights from your spending.',
  },
}

export default function Header({
  activeView,
  onMenuOpen,
  onAddTransaction,
  user,
  onToast,
  onLogout,
  onOpenProfile,
  onOpenSettings,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const meta = PAGE_META[activeView] || PAGE_META.dashboard
  const initials = getInitials(user.name)

  useEffect(() => {
    if (!isProfileOpen) return undefined

    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsProfileOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileOpen])

  const openProfile = () => {
    setIsProfileOpen(false)
    onOpenProfile()
  }

  const openSettings = () => {
    setIsProfileOpen(false)
    onOpenSettings()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
              {meta.title}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 xl:flex">
            <CalendarDays className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            {getDisplayDate()}
          </div>

          <button
            type="button"
            onClick={() =>
              onToast('All caught up — no new notifications.', 'info')
            }
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <Button
            onClick={() => onAddTransaction('expense')}
            aria-label="Add transaction"
            className="px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-white sm:pr-2 sm:ring-1 sm:ring-slate-200"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-bold text-white shadow-sm">
                {initials}
              </span>
              <span className="hidden text-left md:block">
                <span className="block max-w-32 truncate text-xs font-bold text-slate-900">
                  {user.name}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {user.role || 'Personal account'}
                </span>
              </span>
              <ChevronDown
                className="hidden h-3.5 w-3.5 text-slate-400 md:block"
                aria-hidden="true"
              />
            </button>

            {isProfileOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-60 animate-scale-in overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl shadow-slate-950/10 ring-1 ring-slate-200"
              >
                <div className="border-b border-slate-100 px-3 py-3">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openProfile}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  My profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openSettings}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  Settings
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileOpen(false)
                    onLogout()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
