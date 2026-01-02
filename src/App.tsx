import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { ToastProvider } from './components/ui/Toast'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
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

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public route wrapper (redirects to home if already logged in)
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
    initialize()
  }, [initialize])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
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

        {/* Player routes - accessible without login */}
        <Route path="/join" element={<JoinGame />} />
        <Route path="/play/lobby" element={<PlayerLobby />} />
        <Route path="/play/game" element={<PlayerGame />} />
        <Route path="/play/final" element={<PlayerFinal />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/create"
          element={
            <ProtectedRoute>
              <QuizCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id/edit"
          element={
            <ProtectedRoute>
              <QuizEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <GameHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <GameDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <HostSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/lobby"
          element={
            <ProtectedRoute>
              <HostLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/game"
          element={
            <ProtectedRoute>
              <HostGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/final"
          element={
            <ProtectedRoute>
              <HostFinal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
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
