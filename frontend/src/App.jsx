import AuthPage from './pages/AuthPage'
import Workspace from './Workspace'
import { useAuth } from './context/useAuth'

export default function App() {
  const { isAuthenticated } = useAuth()
  const isResetRoute =
    window.location.pathname === '/reset-password'

  return isAuthenticated && !isResetRoute ? <Workspace /> : <AuthPage />
}
