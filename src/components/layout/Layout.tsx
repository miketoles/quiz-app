import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-white">BIP Quiz</span>
          </Link>

          {profile && (
            <nav className="flex items-center gap-4">
              <Link to="/quizzes" className="text-white/80 hover:text-white transition-colors">
                Quizzes
              </Link>
              <Link to="/leaderboard" className="text-white/80 hover:text-white transition-colors">
                Leaderboard
              </Link>
              {(profile.role === 'bcba' || profile.role === 'admin') && (
                <Link to="/history" className="text-white/80 hover:text-white transition-colors">
                  History
                </Link>
              )}
              <Link to="/settings" className="text-white/80 hover:text-white transition-colors">
                Settings
              </Link>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                <span className="text-sm text-white/60">
                  {profile.display_name}
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/30 rounded">
                    {profile.role.toUpperCase()}
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
