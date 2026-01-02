import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../../components/game/Avatar'
import { Button } from '../../components/ui/Button'
import type { GameParticipant, Quiz } from '../../lib/database.types'

export function HostFinal() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gamePin = searchParams.get('pin') || ''

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [participants, setParticipants] = useState<GameParticipant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gamePin) {
      navigate('/host')
      return
    }
    fetchResults()
  }, [gamePin])

  const fetchResults = async () => {
    // Fetch session
    const { data: sessionData } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('game_pin', gamePin)
      .single()

    if (!sessionData) {
      navigate('/host')
      return
    }

    // Fetch quiz
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', sessionData.quiz_id)
      .single()

    setQuiz(quizData)

    // Fetch participants sorted by score
    const { data: participantsData } = await supabase
      .from('game_participants')
      .select('*')
      .eq('game_session_id', sessionData.id)
      .order('total_score', { ascending: false })

    setParticipants(participantsData || [])
    setLoading(false)
  }

  const handlePlayAgain = () => {
    if (quiz) {
      navigate(`/host?quiz=${quiz.id}`)
    } else {
      navigate('/host')
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const topThree = participants.slice(0, 3)
  const others = participants.slice(3)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Final Results</h1>
        <p className="text-white/60 text-xl">{quiz?.title}</p>
      </div>

      {/* Podium */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-12 h-80">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-t-2xl p-6 w-48 text-center">
                <Avatar
                  base={topThree[1].avatar_base}
                  accessory={topThree[1].avatar_accessory}
                  size="xl"
                />
                <p className="text-white font-bold text-xl mt-4 truncate">
                  {topThree[1].nickname}
                </p>
                <p className="text-primary text-2xl font-bold mt-2">
                  {topThree[1].total_score}
                </p>
              </div>
              <div className="bg-gray-400 w-48 h-32 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/80">2</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center -mt-8">
              <div className="bg-yellow-500/20 rounded-t-2xl p-6 w-56 text-center border-2 border-yellow-500">
                <span className="text-4xl mb-2 block">🏆</span>
                <Avatar
                  base={topThree[0].avatar_base}
                  accessory={topThree[0].avatar_accessory}
                  size="xl"
                />
                <p className="text-white font-bold text-2xl mt-4 truncate">
                  {topThree[0].nickname}
                </p>
                <p className="text-primary text-3xl font-bold mt-2">
                  {topThree[0].total_score}
                </p>
              </div>
              <div className="bg-yellow-500 w-56 h-44 flex items-center justify-center">
                <span className="text-7xl font-bold text-white">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-t-2xl p-6 w-44 text-center">
                <Avatar
                  base={topThree[2].avatar_base}
                  accessory={topThree[2].avatar_accessory}
                  size="lg"
                />
                <p className="text-white font-bold text-lg mt-4 truncate">
                  {topThree[2].nickname}
                </p>
                <p className="text-primary text-xl font-bold mt-2">
                  {topThree[2].total_score}
                </p>
              </div>
              <div className="bg-orange-700 w-44 h-24 flex items-center justify-center">
                <span className="text-5xl font-bold text-white/80">3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Players */}
      {others.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Other Players</h2>
          <div className="bg-white/5 rounded-xl overflow-hidden">
            {others.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0"
              >
                <span className="text-white/60 font-bold w-8">#{index + 4}</span>
                <Avatar
                  base={participant.avatar_base}
                  accessory={participant.avatar_accessory}
                  size="sm"
                />
                <span className="text-white font-medium flex-1">{participant.nickname}</span>
                <span className="text-primary font-bold">{participant.total_score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-12">
        <Button variant="secondary" onClick={handleBackToHome}>
          Back to Home
        </Button>
        <Button size="lg" onClick={handlePlayAgain}>
          Play Again
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="max-w-2xl mx-auto mt-12 bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Game Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-white">{participants.length}</p>
            <p className="text-white/60 text-sm">Players</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {participants.reduce((acc, p) => acc + p.total_score, 0)}
            </p>
            <p className="text-white/60 text-sm">Total Points</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {Math.max(...participants.map((p) => p.current_streak), 0)}
            </p>
            <p className="text-white/60 text-sm">Best Streak</p>
          </div>
        </div>
      </div>
    </div>
  )
}
