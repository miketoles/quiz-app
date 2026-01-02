import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../stores/gameStore'
import { Avatar } from '../../components/game/Avatar'
import { Button } from '../../components/ui/Button'

export function PlayerFinal() {
  const navigate = useNavigate()

  const { participants, participantId, reset } = useGameStore()

  const currentPlayer = participants.find((p) => p.id === participantId)
  const sortedParticipants = [...participants].sort((a, b) => b.total_score - a.total_score)
  const playerRank = sortedParticipants.findIndex((p) => p.id === participantId) + 1

  useEffect(() => {
    if (!participantId) {
      navigate('/join')
    }
  }, [participantId])

  const handlePlayAgain = () => {
    reset()
    navigate('/join')
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isWinner = playerRank === 1
  const isTop3 = playerRank <= 3

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Rank Display */}
      <div className="text-center mb-6">
        {isWinner ? (
          <div className="animate-bounce-in">
            <span className="text-6xl block mb-2">crown</span>
            <h1 className="text-4xl font-bold text-yellow-400">You Won!</h1>
          </div>
        ) : isTop3 ? (
          <div className="animate-bounce-in">
            <span className="text-5xl block mb-2">medal</span>
            <h1 className="text-3xl font-bold text-white">Top 3!</h1>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white">Game Over!</h1>
          </div>
        )}
      </div>

      {/* Player Card */}
      <div className={`
        bg-white/10 rounded-2xl p-6 text-center max-w-sm w-full
        ${isWinner ? 'ring-2 ring-yellow-400' : ''}
      `}>
        <Avatar
          base={currentPlayer.avatar_base}
          accessory={currentPlayer.avatar_accessory}
          size="xl"
        />

        <h2 className="text-2xl font-bold text-white mt-4">
          {currentPlayer.nickname}
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-3xl font-bold text-primary">{playerRank}</p>
            <p className="text-white/60 text-sm">Place</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-3xl font-bold text-white">{currentPlayer.total_score}</p>
            <p className="text-white/60 text-sm">Points</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="mt-8 w-full max-w-sm">
        <h3 className="text-lg font-bold text-white mb-4 text-center">Leaderboard</h3>
        <div className="bg-white/5 rounded-xl overflow-hidden">
          {sortedParticipants.slice(0, 5).map((p, index) => (
            <div
              key={p.id}
              className={`
                flex items-center gap-3 p-3 border-b border-white/10 last:border-b-0
                ${p.id === participantId ? 'bg-primary/20' : ''}
              `}
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white'}
              `}>
                {index + 1}
              </span>
              <Avatar base={p.avatar_base} accessory={p.avatar_accessory} size="sm" />
              <span className="flex-1 text-white font-medium truncate">{p.nickname}</span>
              <span className="text-primary font-bold">{p.total_score}</span>
            </div>
          ))}
          {participants.length > 5 && !sortedParticipants.slice(0, 5).some((p) => p.id === participantId) && (
            <>
              <div className="text-center text-white/40 py-2 text-sm">...</div>
              <div className="flex items-center gap-3 p-3 bg-primary/20">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                  {playerRank}
                </span>
                <Avatar base={currentPlayer.avatar_base} accessory={currentPlayer.avatar_accessory} size="sm" />
                <span className="flex-1 text-white font-medium truncate">{currentPlayer.nickname}</span>
                <span className="text-primary font-bold">{currentPlayer.total_score}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8">
        <Button size="lg" onClick={handlePlayAgain}>
          Play Again
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 text-center text-white/60 text-sm">
        <p>Total Players: {participants.length}</p>
        {currentPlayer.current_streak > 0 && (
          <p className="text-answer-yellow mt-1">Best Streak: {currentPlayer.current_streak}</p>
        )}
      </div>
    </div>
  )
}
