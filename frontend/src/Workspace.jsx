import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw, WifiOff } from 'lucide-react'
import AnalyticsView from './components/analytics/AnalyticsView'
import BudgetModal from './components/budgets/BudgetModal'
import BudgetsView from './components/budgets/BudgetsView'
import TotalBudgetModal from './components/budgets/TotalBudgetModal'
import DashboardView from './components/dashboard/DashboardView'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import ProfileModal from './components/settings/ProfileModal'
import SettingsModal from './components/settings/SettingsModal'
import DeleteDialog from './components/transactions/DeleteDialog'
import TransactionModal from './components/transactions/TransactionModal'
import TransactionsView from './components/transactions/TransactionsView'
import Button from './components/ui/Button'
import ToastContainer from './components/ui/Toast'
import { useAuth } from './context/useAuth'
import { changePassword, deleteAccount, updateProfile } from './services/account'
import { getApiErrorMessage } from './services/api'
import {
  fetchBudgets,
  updateBudget,
  updateTotalBudget,
} from './services/budgets'
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from './services/transactions'
import {
  exportTransactionsToCsv,
  exportTransactionsToJson,
} from './utils/csv'
import {
  getMonthKey,
  getMonthLabel,
  getPeriodFromMonthKey,
} from './utils/date'
import {
  getBudgetTone,
  getBudgetUsage,
  getMonthTotals,
  getOverallBudget,
} from './utils/finance'
import { pluralize } from './utils/format'

const VIEW_TITLES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  budgets: 'Budgets',
  analytics: 'Analytics',
}

const sortTransactions = (list) =>
  [...list].sort((a, b) => {
    if (a.date === b.date) return b.id.localeCompare(a.id)
    return b.date.localeCompare(a.date)
  })

export default function Workspace() {
  const { user, logout, updateUser, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [budgetMonthKey, setBudgetMonthKey] = useState(getMonthKey())
  const [periodBudgetData, setPeriodBudgetData] = useState({})
  const [periodBudgetStatus, setPeriodBudgetStatus] = useState({})
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [transactionModal, setTransactionModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [budgetTarget, setBudgetTarget] = useState(null)
  const [isTotalBudgetOpen, setIsTotalBudgetOpen] = useState(false)
  const [accountModal, setAccountModal] = useState(null)
  const [toasts, setToasts] = useState([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [loadError, setLoadError] = useState('')

  const currentMonthKey = getMonthKey()

  // The overall plan is always exactly the sum of the category envelopes.
  const totalBudgetLimit = useMemo(
    () =>
      Math.round(
        budgets.reduce(
          (total, budget) => total + (Number(budget.limit) || 0),
          0,
        ) * 100,
      ) / 100,
    [budgets],
  )

  const budgetSummary = useMemo(() => {
    const usage = getBudgetUsage(budgets, transactions, currentMonthKey)
    const categoryOverall = getOverallBudget(usage)
    const limit =
      totalBudgetLimit > 0 ? totalBudgetLimit : categoryOverall.limit
    const spent = getMonthTotals(transactions, currentMonthKey).expenses
    const ratio = limit > 0 ? spent / limit : 0

    return {
      limit,
      spent,
      percent: Math.round(ratio * 100),
      tone: getBudgetTone(ratio),
    }
  }, [budgets, transactions, currentMonthKey, totalBudgetLimit])

  const periodBudgets = useMemo(
    () =>
      budgetMonthKey === currentMonthKey
        ? budgets
        : periodBudgetData[budgetMonthKey] || [],
    [budgetMonthKey, currentMonthKey, budgets, periodBudgetData],
  )

  const periodStatus = periodBudgetStatus[budgetMonthKey]
  const isLoadingBudgets =
    budgetMonthKey !== currentMonthKey && Boolean(periodStatus?.loading)
  const budgetPeriodError =
    budgetMonthKey !== currentMonthKey ? periodStatus?.error || '' : ''

  const budgetPeriod = useMemo(
    () => getPeriodFromMonthKey(budgetMonthKey),
    [budgetMonthKey],
  )

  const periodTotalBudgetLimit = useMemo(
    () =>
      Math.round(
        periodBudgets.reduce(
          (total, budget) => total + (Number(budget.limit) || 0),
          0,
        ) * 100,
      ) / 100,
    [periodBudgets],
  )

  const periodSpent = useMemo(
    () => getMonthTotals(transactions, budgetMonthKey).expenses,
    [transactions, budgetMonthKey],
  )

  const budgetPeriodLabel = getMonthLabel(budgetMonthKey, 'long')

  const addToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((current) => [...current.slice(-3), { id, message, type }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const loadBudgetPeriod = useCallback(
    async (monthKey, force = false) => {
      if (!monthKey || monthKey === getMonthKey()) return
      if (!force && periodBudgetData[monthKey]) return

      setPeriodBudgetStatus((current) => ({
        ...current,
        [monthKey]: { loading: true, error: '' },
      }))

      try {
        const data = await fetchBudgets(getPeriodFromMonthKey(monthKey))

        setPeriodBudgetData((current) => ({
          ...current,
          [monthKey]: data.budgets,
        }))
        setPeriodBudgetStatus((current) => ({
          ...current,
          [monthKey]: { loading: false, error: '' },
        }))
      } catch (error) {
        if (error?.response?.status === 401) {
          logout()
          return
        }

        setPeriodBudgetStatus((current) => ({
          ...current,
          [monthKey]: { loading: false, error: getApiErrorMessage(error) },
        }))
      }
    },
    [periodBudgetData, logout],
  )

  const retryWorkspaceData = async () => {
    setIsLoadingTransactions(true)
    setLoadError('')

    try {
      const [transactionData, budgetData] = await Promise.all([
        fetchTransactions(),
        fetchBudgets(),
      ])

      setTransactions(sortTransactions(transactionData))
      setBudgets(budgetData.budgets)
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      setLoadError(getApiErrorMessage(error))
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  useEffect(() => {
    let isActive = true

    Promise.all([fetchTransactions(), fetchBudgets()])
      .then(([transactionData, budgetData]) => {
        if (!isActive) return
        setTransactions(sortTransactions(transactionData))
        setBudgets(budgetData.budgets)
        setLoadError('')
      })
      .catch((error) => {
        if (!isActive) return

        if (error?.response?.status === 401) {
          logout()
          return
        }

        setLoadError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (isActive) setIsLoadingTransactions(false)
      })

    return () => {
      isActive = false
    }
  }, [logout])

  useEffect(() => {
    document.title = `${VIEW_TITLES[activeView]} · Budgetly`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeView])

  useEffect(() => {
    if (!isSidebarOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isSidebarOpen])

  const handleNavigate = (view) => {
    setActiveView(view)
    setIsSidebarOpen(false)
  }

  const handleBudgetMonthChange = (nextMonthKey) => {
    if (!nextMonthKey || nextMonthKey > currentMonthKey) return
    setBudgetMonthKey(nextMonthKey)
    loadBudgetPeriod(nextMonthKey)
  }

  const retryBudgetPeriod = () => loadBudgetPeriod(budgetMonthKey, true)

  const openAddTransaction = (type) => {
    setTransactionModal({
      transaction: null,
      defaultType: type === 'income' ? 'income' : 'expense',
    })
  }

  const openEditTransaction = (transaction) => {
    setTransactionModal({ transaction, defaultType: transaction.type })
  }

  const handleSaveTransaction = async (data) => {
    const isEditing = Boolean(data.id)

    try {
      if (isEditing) {
        const updated = await updateTransaction(data.id, data)

        setTransactions((current) =>
          sortTransactions(
            current.map((transaction) =>
              transaction.id === updated.id ? updated : transaction,
            ),
          ),
        )
        addToast('Transaction updated successfully.')
      } else {
        const created = await createTransaction(data)

        setTransactions((current) => sortTransactions([created, ...current]))
        addToast(
          `${created.type === 'income' ? 'Income' : 'Expense'} added successfully.`,
        )
      }

      setTransactionModal(null)
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleDeleteTransaction = async () => {
    if (!deleteTarget) return

    try {
      await deleteTransaction(deleteTarget.id)
      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== deleteTarget.id),
      )
      addToast(`Deleted “${deleteTarget.title}”.`, 'info')
      setDeleteTarget(null)
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleSaveBudget = async (id, limit) => {
    const target = periodBudgets.find((budget) => budget.id === id)

    if (!target) return

    try {
      const updated = await updateBudget(
        target.category,
        limit,
        budgetPeriod,
      )

      const applyUpdate = (list) =>
        list.map((budget) =>
          budget.id === updated.id || budget.category === updated.category
            ? updated
            : budget,
        )

      if (budgetMonthKey === currentMonthKey) {
        setBudgets(applyUpdate)
      } else {
        setPeriodBudgetData((current) => ({
          ...current,
          [budgetMonthKey]: applyUpdate(current[budgetMonthKey] || []),
        }))
      }

      addToast(`Budget limit updated for ${budgetPeriodLabel}.`)
      setBudgetTarget(null)
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleSaveTotalBudget = async (limit) => {
    try {
      const updated = await updateTotalBudget(limit, budgetPeriod)

      if (budgetMonthKey === currentMonthKey) {
        setBudgets(updated.budgets)
      } else {
        setPeriodBudgetData((current) => ({
          ...current,
          [budgetMonthKey]: updated.budgets,
        }))
      }

      addToast(`Monthly budget updated for ${budgetPeriodLabel}.`)
      setIsTotalBudgetOpen(false)
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleSaveProfile = async (payload) => {
    try {
      const updated = await updateProfile(payload)

      updateUser(updated)
      addToast('Profile updated successfully.')

      return updated
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleDeleteAccount = async (payload) => {
    try {
      await deleteAccount(payload)
      setAccountModal(null)
      logout()
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleSavePreferences = async ({ currency }) => {
    try {
      const updated = await updateProfile({ currency })

      updateUser(updated)
      addToast('Currency preference updated.')

      return updated
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleChangePassword = async (payload) => {
    try {
      await changePassword(payload)
      addToast('Password updated successfully.')
    } catch (error) {
      if (error?.response?.status === 401) {
        logout()
        return
      }

      throw new Error(getApiErrorMessage(error), { cause: error })
    }
  }

  const handleExport = () => {
    const count = exportTransactionsToCsv(transactions, {
      currency: user.currency,
    })
    addToast(`Exported ${pluralize(count, 'transaction')} to CSV.`)
  }

  const handleExportAll = (format) => {
    const options = { currency: user.currency }
    const count =
      format === 'json'
        ? exportTransactionsToJson(transactions, options)
        : exportTransactionsToCsv(transactions, options)

    addToast(
      `Exported ${pluralize(count, 'transaction')} to ${format.toUpperCase()}.`,
    )
  }

  const handleOpenProfile = async () => {
    setAccountModal('profile')

    try {
      await refreshUser()
    } catch (error) {
      if (error?.response?.status === 401) logout()
    }
  }

  const renderView = () => {
    if (activeView === 'transactions') {
      return (
        <TransactionsView
          transactions={transactions}
          onAddTransaction={openAddTransaction}
          onEditTransaction={openEditTransaction}
          onDeleteTransaction={setDeleteTarget}
          onExport={handleExport}
        />
      )
    }

    if (activeView === 'budgets') {
      return (
        <BudgetsView
          budgets={periodBudgets}
          transactions={transactions}
          totalLimit={periodTotalBudgetLimit}
          monthKey={budgetMonthKey}
          currentMonthKey={currentMonthKey}
          isLoading={isLoadingBudgets}
          error={budgetPeriodError}
          onMonthChange={handleBudgetMonthChange}
          onRetry={retryBudgetPeriod}
          onEditBudget={setBudgetTarget}
          onEditTotalBudget={() => setIsTotalBudgetOpen(true)}
        />
      )
    }

    if (activeView === 'analytics') {
      return <AnalyticsView transactions={transactions} />
    }

    return (
      <DashboardView
        transactions={transactions}
        budgets={budgets}
        totalLimit={totalBudgetLimit}
        onNavigate={handleNavigate}
        onEditTransaction={openEditTransaction}
        onDeleteTransaction={setDeleteTarget}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        transactionCount={transactions.length}
        budgetSummary={budgetSummary}
      />

      <div className="lg:pl-72">
        <Header
          activeView={activeView}
          onMenuOpen={() => setIsSidebarOpen(true)}
          onAddTransaction={openAddTransaction}
          user={user}
          onToast={addToast}
          onLogout={logout}
          onOpenProfile={handleOpenProfile}
          onOpenSettings={() => setAccountModal('settings')}
        />

        <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {isLoadingTransactions ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                <Loader2
                  className="h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
              </span>
              <p className="text-sm font-semibold text-slate-600">
                Loading your workspace...
              </p>
            </div>
          ) : loadError ? (
            <div className="card-surface mx-auto max-w-md rounded-2xl px-6 py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                <WifiOff className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Could not load your workspace
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {loadError}
              </p>
              <Button onClick={retryWorkspaceData} className="mt-5">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : (
            <div key={activeView} className="animate-fade-in">
              {renderView()}
            </div>
          )}
        </main>
      </div>

      {transactionModal ? (
        <TransactionModal
          transaction={transactionModal.transaction}
          defaultType={transactionModal.defaultType}
          onClose={() => setTransactionModal(null)}
          onSave={handleSaveTransaction}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteDialog
          transaction={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteTransaction}
        />
      ) : null}

      {budgetTarget ? (
        <BudgetModal
          budget={budgetTarget}
          periodLabel={budgetPeriodLabel}
          onClose={() => setBudgetTarget(null)}
          onSave={handleSaveBudget}
        />
      ) : null}

      {isTotalBudgetOpen ? (
        <TotalBudgetModal
          currentLimit={periodTotalBudgetLimit}
          spent={periodSpent}
          periodLabel={budgetPeriodLabel}
          onClose={() => setIsTotalBudgetOpen(false)}
          onSave={handleSaveTotalBudget}
        />
      ) : null}

      {accountModal === 'profile' ? (
        <ProfileModal
          user={user}
          onClose={() => setAccountModal(null)}
          onSaveProfile={handleSaveProfile}
          onDeleteAccount={handleDeleteAccount}
        />
      ) : null}

      {accountModal === 'settings' ? (
        <SettingsModal
          user={user}
          transactionCount={transactions.length}
          onClose={() => setAccountModal(null)}
          onSavePreferences={handleSavePreferences}
          onChangePassword={handleChangePassword}
          onExportData={handleExportAll}
        />
      ) : null}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
