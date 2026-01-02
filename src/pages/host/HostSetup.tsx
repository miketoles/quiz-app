import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useGameStore } from '../../stores/gameStore'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import type { Quiz } from '../../lib/database.types'

export function HostSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedQuizId = searchParams.get('quiz')

  const { profile } = useAuthStore()
  const { createGame } = useGameStore()

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    if (preselectedQuizId && quizzes.length > 0) {
      const quiz = quizzes.find((q) => q.id === preselectedQuizId)
      if (quiz) setSelectedQuiz(quiz)
    }
  }, [preselectedQuizId, quizzes])

  const fetchQuizzes = async () => {
    const { data, error: fetchError } = await supabase
      .from('quizzes')
      .select('*')
      .order('updated_at', { ascending: false })

    if (fetchError) {
      setError('Failed to load quizzes')
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const handleStartGame = async () => {
    if (!selectedQuiz) return

    // Use profile id if logged in, otherwise null for guest hosts
    const hostId = profile?.id || null

    setStarting(true)
    setError('')

    const { error: createError, pin } = await createGame(selectedQuiz.id, hostId, {
      timeLimit: selectedQuiz.time_limit,
      speedScoring: selectedQuiz.speed_scoring,
      pointsPerQuestion: selectedQuiz.points_per_question,
      autoAdvance: selectedQuiz.auto_advance,
    })

    if (createError) {
      setError(createError.message || 'Failed to create game')
      setStarting(false)
      return
    }

    // Navigate to lobby
    navigate(`/host/lobby?pin=${pin}`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Host a Game</h1>
          <p className="text-white/60 mt-2">Select a quiz to start hosting</p>
        </div>

        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <span className="text-5xl block mb-4">📚</span>
            <h2 className="text-xl font-bold text-white">No quizzes available</h2>
            <p className="text-white/60 mt-2">Create a quiz first to host a game</p>
            <Button className="mt-4" onClick={() => navigate('/quizzes/create')}>
              Create Quiz
            </Button>
          </Card>
        ) : (
          <>
            {/* Quiz Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className={`cursor-pointer transition-all ${
                    selectedQuiz?.id === quiz.id
                      ? 'ring-2 ring-primary bg-primary/20'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
                  </div>
                  {quiz.description && (
                    <p className="text-white/60 text-sm mt-2 line-clamp-2">{quiz.description}</p>
                  )}
                  <div className="flex gap-2 mt-3 text-xs text-white/50">
                    <span>{quiz.time_limit}s</span>
                    <span>|</span>
                    <span>{quiz.points_per_question} pts</span>
                    {quiz.speed_scoring && (
                      <>
                        <span>|</span>
                        <span>Speed scoring</span>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Quiz Actions */}
            {selectedQuiz && (
              <Card className="bg-primary/20 border-primary/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Ready to host: {selectedQuiz.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      Players will scan a QR code or enter a PIN to join
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleStartGame}
                    isLoading={starting}
                  >
                    Start Game
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
