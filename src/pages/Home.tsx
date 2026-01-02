import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'

export function Home() {
  const { profile } = useAuthStore()

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {profile?.display_name || 'there'}!
          </h1>
          <p className="text-white/60 mt-2">
            Create quizzes and host training sessions for your team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Quiz */}
          <Card className="hover:ring-2 hover:ring-answer-green/50 transition-all cursor-pointer bg-answer-green/10 border border-answer-green/30">
            <Link to="/quizzes/create" className="block">
              <div className="text-center">
                <span className="text-4xl">✨</span>
                <h2 className="text-xl font-bold text-white mt-4">Create Quiz</h2>
                <p className="text-white/60 mt-2 text-sm">
                  Build a new quiz for your team
                </p>
              </div>
            </Link>
          </Card>

          {/* Host Game */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/host" className="block">
              <div className="text-center">
                <span className="text-4xl">📺</span>
                <h2 className="text-xl font-bold text-white mt-4">Host Game</h2>
                <p className="text-white/60 mt-2 text-sm">
                  Start a live quiz session
                </p>
              </div>
            </Link>
          </Card>

          {/* Join a Game */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/join" className="block">
              <div className="text-center">
                <span className="text-4xl">🎮</span>
                <h2 className="text-xl font-bold text-white mt-4">Join Game</h2>
                <p className="text-white/60 mt-2 text-sm">
                  Enter a PIN or scan QR code to join a live quiz
                </p>
              </div>
            </Link>
          </Card>

          {/* View Quizzes */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/quizzes" className="block">
              <div className="text-center">
                <span className="text-4xl">📚</span>
                <h2 className="text-xl font-bold text-white mt-4">My Quizzes</h2>
                <p className="text-white/60 mt-2 text-sm">
                  View and manage your quizzes
                </p>
              </div>
            </Link>
          </Card>

          {/* Game History */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/history" className="block">
              <div className="text-center">
                <span className="text-4xl">📊</span>
                <h2 className="text-xl font-bold text-white mt-4">Game History</h2>
                <p className="text-white/60 mt-2 text-sm">
                  Review past games and player performance
                </p>
              </div>
            </Link>
          </Card>

          {/* View Leaderboard */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/leaderboard" className="block">
              <div className="text-center">
                <span className="text-4xl">🏆</span>
                <h2 className="text-xl font-bold text-white mt-4">Leaderboard</h2>
                <p className="text-white/60 mt-2 text-sm">
                  See top performers and rankings
                </p>
              </div>
            </Link>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-white/40">
            <span className="text-4xl block mb-2">🎯</span>
            <p>No recent activity yet.</p>
            <p className="text-sm mt-1">Create a quiz or host a game to get started!</p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
