import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useGuestStore } from './stores/guestStore'
import { config } from './lib/config'
import { ToastProvider } from './components/ui/Toast'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { GuestSetup } from './pages/GuestSetup'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { QuizList } from './pages/quiz/QuizList'
import { QuizCreate } from './pages/quiz/QuizCreate'
import { QuizEdit } from './pages/quiz/QuizEdit'
import { HostSetup } from './pages/host/HostSetup'
import { HostLobby } from './pages/host/HostLobby'
import { HostGame } from './pages/host/HostGame'
import { HostFinal } from './pages/host/HostFinal'
import { JoinGame } from './pages/play/JoinGame'
import { PlayerLobby } from './pages/play/PlayerLobby'
import { PlayerGame } from './pages/play/PlayerGame'
import { PlayerFinal } from './pages/play/PlayerFinal'
import { GameHistory } from './pages/history/GameHistory'
import { GameDetail } from './pages/history/GameDetail'
import { Leaderboard } from './pages/leaderboard/Leaderboard'

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-white/60 mt-4">Loading...</p>
      </div>
    </div>
  )
}

// Route wrapper - handles both auth and guest modes
function AppRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()
  const { isSetup } = useGuestStore()

  if (config.authRequired) {
    // Auth mode: require login
    if (loading) {
      return <LoadingScreen />
    }
    if (!session) {
      return <Navigate to="/login" replace />
    }
  } else {
    // Guest mode: require guest setup
    if (!isSetup) {
      return <Navigate to="/welcome" replace />
    }
  }

  return <>{children}</>
}

// Public route wrapper (for login/register when auth is required)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()

  if (loading) {
    return <LoadingScreen />
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => {
    // Only initialize auth if required
    if (config.authRequired) {
      initialize()
    }
  }, [initialize])

  if (config.authRequired && loading) {
    return <LoadingScreen />
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Welcome/Setup route for guest mode */}
          <Route path="/welcome" element={<GuestSetup />} />

          {/* Auth routes - only used when authRequired is true */}
          {config.authRequired && (
            <>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
            </>
          )}

          {/* Player routes - always accessible (they have their own setup) */}
          <Route path="/join" element={<JoinGame />} />
          <Route path="/play/lobby" element={<PlayerLobby />} />
          <Route path="/play/game" element={<PlayerGame />} />
          <Route path="/play/final" element={<PlayerFinal />} />

          {/* Main app routes */}
          <Route
            path="/"
            element={
              <AppRoute>
                <Home />
              </AppRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <AppRoute>
                <QuizList />
              </AppRoute>
            }
          />
          <Route
            path="/quizzes/create"
            element={
              <AppRoute>
                <QuizCreate />
              </AppRoute>
            }
          />
          <Route
            path="/quizzes/:id/edit"
            element={
              <AppRoute>
                <QuizEdit />
              </AppRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <AppRoute>
                <Leaderboard />
              </AppRoute>
            }
          />
          <Route
            path="/history"
            element={
              <AppRoute>
                <GameHistory />
              </AppRoute>
            }
          />
          <Route
            path="/history/:id"
            element={
              <AppRoute>
                <GameDetail />
              </AppRoute>
            }
          />
          <Route
            path="/host"
            element={
              <AppRoute>
                <HostSetup />
              </AppRoute>
            }
          />
          <Route
            path="/host/lobby"
            element={
              <AppRoute>
                <HostLobby />
              </AppRoute>
            }
          />
          <Route
            path="/host/game"
            element={
              <AppRoute>
                <HostGame />
              </AppRoute>
            }
          />
          <Route
            path="/host/final"
            element={
              <AppRoute>
                <HostFinal />
              </AppRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AppRoute>
                <Settings />
              </AppRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
