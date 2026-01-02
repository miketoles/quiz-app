import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGameStore } from '../../stores/gameStore'
import { Timer } from '../../components/game/Timer'

export function PlayerGame() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gamePin = searchParams.get('pin') || ''

  const {
    session,
    currentQuestion,
    hasAnswered,
    selectedOptionId,
    submitAnswer,
    participantId,
    participants,
  } = useGameStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentPlayer = participants.find((p) => p.id === participantId)

  useEffect(() => {
    if (!gamePin || !participantId) {
      navigate('/join')
      return
    }
  }, [gamePin, participantId])

  useEffect(() => {
    // When game ends, navigate to final screen
    if (session?.status === 'finished') {
      navigate(`/play/final?pin=${gamePin}`)
    }
  }, [session?.status, gamePin])

  const handleAnswer = async (optionId: string) => {
    if (hasAnswered || isSubmitting) return

    setIsSubmitting(true)
    await submitAnswer(optionId)
    setIsSubmitting(false)
  }

  const colors = [
    { bg: 'bg-answer-red', icon: '\u25B2' },      // Triangle
    { bg: 'bg-answer-blue', icon: '\u25C6' },     // Diamond
    { bg: 'bg-answer-yellow', icon: '\u25CF' },   // Circle
    { bg: 'bg-answer-green', icon: '\u25A0' },    // Square
  ]

  // Waiting for next question
  if (session?.status === 'results' || !currentQuestion) {
    const selectedOption = currentQuestion?.options.find((o) => o.id === selectedOptionId)
    const isCorrect = selectedOption?.is_correct

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {hasAnswered ? (
          <div className="text-center animate-bounce-in">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isCorrect ? 'bg-success' : 'bg-error'
              }`}
            >
              <span className="text-6xl text-white">
                {isCorrect ? '\u2713' : '\u2717'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isCorrect ? 'Correct!' : 'Wrong!'}
            </h1>
            {currentPlayer && (
              <p className="text-2xl text-primary font-bold mt-4">
                {currentPlayer.total_score} points
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Time's up!</h1>
            <p className="text-white/60">You didn't answer in time</p>
          </div>
        )}

        <p className="text-white/60 mt-8">
          Waiting for next question...
        </p>
      </div>
    )
  }

  // Answer screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-black/30 p-4 flex items-center justify-between">
        <div className="text-white font-bold">
          Q{(session?.current_question_index ?? 0) + 1}
        </div>
        <Timer
          duration={session?.time_limit || 20}
          size="sm"
        />
        <div className="text-primary font-bold">
          {currentPlayer?.total_score || 0} pts
        </div>
      </div>

      {/* Warmup indicator */}
      {currentQuestion.is_warmup && (
        <div className="bg-answer-yellow/20 py-2 text-center">
          <span className="text-answer-yellow font-bold">Just for fun!</span>
        </div>
      )}

      {/* Question text - mobile shows truncated */}
      <div className="p-4 bg-white/5">
        <p className="text-white text-lg text-center line-clamp-3">
          {currentQuestion.question_text}
        </p>
      </div>

      {/* Answer buttons - full screen */}
      <div className="flex-1 grid grid-cols-1 gap-2 p-2">
        {currentQuestion.options.slice(0, 4).map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleAnswer(option.id)}
            disabled={hasAnswered || isSubmitting}
            className={`
              ${colors[index].bg}
              rounded-xl
              flex items-center gap-4
              px-6 py-4
              text-white font-bold text-lg
              transition-all
              ${hasAnswered
                ? selectedOptionId === option.id
                  ? 'ring-4 ring-white opacity-100'
                  : 'opacity-40'
                : 'active:scale-[0.98] hover:brightness-110'
              }
              disabled:cursor-not-allowed
            `}
          >
            <span className="text-3xl">{colors[index].icon}</span>
            <span className="flex-1 text-left">{option.option_text}</span>
          </button>
        ))}
      </div>

      {/* Submitted overlay */}
      {hasAnswered && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-surface rounded-2xl p-8 text-center animate-bounce-in">
            <span className="text-5xl block mb-4">✅</span>
            <h2 className="text-xl font-bold text-white">Answer Submitted!</h2>
            <p className="text-white/60 mt-2">Wait for results...</p>
          </div>
        </div>
      )}
    </div>
  )
}
