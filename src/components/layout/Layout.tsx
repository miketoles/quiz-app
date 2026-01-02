import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useGuestStore } from '../../stores/guestStore'
import { config } from '../../lib/config'
import { Button } from '../ui/Button'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut, session } = useAuthStore()
  const { guestName, clearGuest } = useGuestStore()
  const navigate = useNavigate()

  const displayName = profile?.display_name || guestName || 'Guest'
  const isLoggedIn = !!session
  const isGuest = !session && !!guestName

  const handleSignOut = async () => {
    if (isLoggedIn) {
      await signOut()
    }
    if (isGuest) {
      clearGuest()
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-white">{config.appName}</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/quizzes" className="text-white/80 hover:text-white transition-colors">
              Quizzes
            </Link>
            <Link to="/host" className="text-white/80 hover:text-white transition-colors">
              Host
            </Link>
            <Link to="/join" className="text-white/80 hover:text-white transition-colors">
              Join
            </Link>
            <Link to="/leaderboard" className="text-white/80 hover:text-white transition-colors">
              Leaderboard
            </Link>
            <Link to="/history" className="text-white/80 hover:text-white transition-colors">
              History
            </Link>

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
              <span className="text-sm text-white/60">
                {displayName}
              </span>
              {(isLoggedIn || isGuest) && (
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  {isLoggedIn ? 'Sign Out' : 'Change User'}
                </Button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
