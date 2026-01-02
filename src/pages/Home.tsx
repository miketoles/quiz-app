import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'

export function Home() {
  const { profile } = useAuthStore()
  const isBCBA = profile?.role === 'bcba' || profile?.role === 'admin'

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {profile?.display_name}!
          </h1>
          <p className="text-white/60 mt-2">
            {isBCBA
              ? 'Create quizzes and host training sessions for your team'
              : 'Join a quiz or check your performance on the leaderboard'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Join a Game - Available to all */}
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

          {/* View Leaderboard - Available to all */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/leaderboard" className="block">
              <div className="text-center">
                <span className="text-4xl">🏆</span>
                <h2 className="text-xl font-bold text-white mt-4">Leaderboard</h2>
                <p className="text-white/60 mt-2 text-sm">
                  See top performers and your ranking
                </p>
              </div>
            </Link>
          </Card>

          {/* View Quizzes - Available to all */}
          <Card className="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <Link to="/quizzes" className="block">
              <div className="text-center">
                <span className="text-4xl">📚</span>
                <h2 className="text-xl font-bold text-white mt-4">Quizzes</h2>
                <p className="text-white/60 mt-2 text-sm">
                  {isBCBA ? 'Create and manage your quizzes' : 'Browse available quizzes'}
                </p>
              </div>
            </Link>
          </Card>

          {/* BCBA-only actions */}
          {isBCBA && (
            <>
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
            </>
          )}
        </div>

        {/* Recent Activity Section */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-white/40">
            <span className="text-4xl block mb-2">🎯</span>
            <p>No recent activity yet.</p>
            <p className="text-sm mt-1">Join a game or create a quiz to get started!</p>
          </div>
        </Card>

        {/* Quick Stats for RBTs */}
        {!isBCBA && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-white/60 text-sm">Games Played</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-answer-green">0%</div>
              <div className="text-white/60 text-sm">Accuracy</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-answer-yellow">0</div>
              <div className="text-white/60 text-sm">Total Points</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-answer-red">0</div>
              <div className="text-white/60 text-sm">Best Streak</div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}
