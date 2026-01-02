import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useGameStore } from '../../stores/gameStore'
import { Timer } from '../../components/game/Timer'
import { AnswerButton } from '../../components/game/AnswerButton'
import { Avatar } from '../../components/game/Avatar'
import { Button } from '../../components/ui/Button'
import type { GameSession, Question, QuestionOption, GameParticipant, QuestionResponse } from '../../lib/database.types'

type GamePhase = 'question' | 'results'

interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}

export function HostGame() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gamePin = searchParams.get('pin') || ''

  const { nextQuestion, showResults, endGame } = useGameStore()

  const [session, setSession] = useState<GameSession | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [participants, setParticipants] = useState<GameParticipant[]>([])
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [phase, setPhase] = useState<GamePhase>('question')
  const [loading, setLoading] = useState(true)
  const [timerComplete, setTimerComplete] = useState(false)

  const currentQuestion = questions[session?.current_question_index ?? 0]
  const totalQuestions = questions.length
  const questionNumber = (session?.current_question_index ?? 0) + 1

  useEffect(() => {
    if (!gamePin) {
      navigate('/host')
      return
    }
    fetchGameData()
  }, [gamePin])

  useEffect(() => {
    if (!session) return
    setupRealtimeSubscription()
  }, [session?.id])

  const fetchGameData = async () => {
    // Fetch game session
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('game_pin', gamePin)
      .single()

    if (sessionError || !sessionData) {
      navigate('/host')
      return
    }

    setSession(sessionData)

    // Fetch questions with options
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', sessionData.quiz_id)
      .order('order_index')

    const questionIds = (questionsData || []).map((q) => q.id)
    const { data: optionsData } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds)
      .order('order_index')

    const questionsWithOptions = (questionsData || []).map((q) => ({
      ...q,
      options: (optionsData || []).filter((o) => o.question_id === q.id),
    }))

    setQuestions(questionsWithOptions)

    // Fetch participants
    const { data: participantsData } = await supabase
      .from('game_participants')
      .select('*')
      .eq('game_session_id', sessionData.id)
      .order('total_score', { ascending: false })

    setParticipants(participantsData || [])

    // Check if we're in results phase
    if (sessionData.status === 'results') {
      setPhase('results')
      fetchResponses(sessionData.id, questionsWithOptions[sessionData.current_question_index]?.id)
    }

    setLoading(false)
  }

  const setupRealtimeSubscription = async () => {
    if (!session) return

    // Subscribe to responses
    const channel = supabase
      .channel(`game-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'question_responses',
          filter: `game_session_id=eq.${session.id}`,
        },
        (payload) => {
          if ((payload.new as QuestionResponse).question_id === currentQuestion?.id) {
            setResponses((prev) => [...prev, payload.new as QuestionResponse])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchResponses = async (sessionId: string, questionId: string) => {
    const { data } = await supabase
      .from('question_responses')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('question_id', questionId)

    setResponses(data || [])
  }

  const handleTimerComplete = useCallback(async () => {
    setTimerComplete(true)
    // Auto-show results when timer completes
    await handleShowResults()
  }, [session, currentQuestion])

  const handleShowResults = async () => {
    if (!session || !currentQuestion) return

    await showResults()
    setPhase('results')
    await fetchResponses(session.id, currentQuestion.id)

    // Refresh participants to get updated scores
    const { data: participantsData } = await supabase
      .from('game_participants')
      .select('*')
      .eq('game_session_id', session.id)
      .order('total_score', { ascending: false })

    setParticipants(participantsData || [])
  }

  const handleNextQuestion = async () => {
    const isLastQuestion = questionNumber >= totalQuestions

    if (isLastQuestion) {
      await endGame()
      navigate(`/host/final?pin=${gamePin}`)
    } else {
      await nextQuestion()
      setPhase('question')
      setResponses([])
      setTimerComplete(false)

      // Refresh session to get new question index
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_pin', gamePin)
        .single()

      setSession(sessionData)
    }
  }

  const handleEndGame = async () => {
    if (confirm('Are you sure you want to end the game?')) {
      await endGame()
      navigate(`/host/final?pin=${gamePin}`)
    }
  }

  const getResponseCountForOption = (optionId: string) => {
    return responses.filter((r) => r.selected_option_id === optionId).length
  }

  const colors: ('red' | 'blue' | 'yellow' | 'green')[] = ['red', 'blue', 'yellow', 'green']

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="bg-primary/30 px-4 py-2 rounded-lg text-white font-bold">
            {questionNumber} / {totalQuestions}
          </span>
          {currentQuestion.is_warmup && (
            <span className="bg-answer-yellow/30 px-4 py-2 rounded-lg text-answer-yellow font-bold">
              Just for fun!
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {phase === 'question' && !timerComplete && (
            <Button variant="secondary" onClick={handleShowResults}>
              Show Results
            </Button>
          )}
          <Button variant="ghost" onClick={handleEndGame}>
            End Game
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {phase === 'question' ? (
          <>
            {/* Timer */}
            {!timerComplete && (
              <div className="mb-8">
                <Timer
                  duration={session?.time_limit || 20}
                  onComplete={handleTimerComplete}
                  size="lg"
                />
              </div>
            )}

            {/* Question */}
            <div className="bg-white/5 rounded-2xl p-8 max-w-4xl w-full mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
              {currentQuestion.options.slice(0, 4).map((option, index) => (
                <AnswerButton
                  key={option.id}
                  color={colors[index]}
                  text={option.option_text}
                  disabled
                />
              ))}
            </div>

            {/* Response Count */}
            <div className="mt-8 text-center">
              <span className="text-4xl font-bold text-white">{responses.length}</span>
              <span className="text-white/60 ml-2">/ {participants.length} answered</span>
            </div>
          </>
        ) : (
          <>
            {/* Results Phase */}
            <div className="bg-white/5 rounded-2xl p-6 max-w-4xl w-full mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
                {currentQuestion.question_text}
              </h2>
              <p className="text-success text-center text-lg">
                Correct: {currentQuestion.options.find((o) => o.is_correct)?.option_text}
              </p>
            </div>

            {/* Answer Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mb-8">
              {currentQuestion.options.slice(0, 4).map((option, index) => (
                <AnswerButton
                  key={option.id}
                  color={colors[index]}
                  text={option.option_text}
                  isCorrect={option.is_correct}
                  showResult
                  responseCount={getResponseCountForOption(option.id)}
                  totalResponses={responses.length}
                />
              ))}
            </div>

            {/* Who got it right */}
            <div className="bg-white/5 rounded-xl p-6 max-w-4xl w-full">
              <h3 className="text-lg font-bold text-white mb-4">
                {responses.filter((r) => r.is_correct).length} players got it right!
              </h3>
              <div className="flex flex-wrap gap-3">
                {participants
                  .filter((p) =>
                    responses.some((r) => r.participant_id === p.id && r.is_correct)
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 bg-success/20 px-3 py-1 rounded-full"
                    >
                      <Avatar base={p.avatar_base} accessory={p.avatar_accessory} size="sm" />
                      <span className="text-white text-sm">{p.nickname}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-8">
              <Button size="lg" onClick={handleNextQuestion}>
                {questionNumber >= totalQuestions ? 'See Final Results' : 'Next Question'}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Leaderboard Strip */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur p-4">
        <div className="flex items-center justify-center gap-6 overflow-x-auto">
          {participants.slice(0, 5).map((p, index) => (
            <div key={p.id} className="flex items-center gap-2 shrink-0">
              <span className="text-white/60 font-bold">#{index + 1}</span>
              <Avatar base={p.avatar_base} accessory={p.avatar_accessory} size="sm" />
              <span className="text-white font-medium">{p.nickname}</span>
              <span className="text-primary font-bold">{p.total_score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
