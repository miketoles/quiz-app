import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGameStore } from '../../stores/gameStore'
import { Avatar } from '../../components/game/Avatar'
import { AVATARS } from '../../lib/constants'

export function PlayerLobby() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gamePin = searchParams.get('pin') || ''

  const { session, participants, participantId } = useGameStore()

  // Get current player info
  const currentPlayer = participants.find((p) => p.id === participantId)

  useEffect(() => {
    if (!gamePin || !participantId) {
      navigate('/join')
      return
    }
  }, [gamePin, participantId])

  useEffect(() => {
    // When game starts (status changes to 'question'), navigate to answer page
    if (session?.status === 'question') {
      navigate(`/play/game?pin=${gamePin}`)
    }
  }, [session?.status, gamePin])

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Player Info */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <Avatar
            base={currentPlayer.avatar_base}
            accessory={currentPlayer.avatar_accessory}
            size="xl"
          />
        </div>
        <h1 className="text-3xl font-bold text-white">{currentPlayer.nickname}</h1>
        <p className="text-white/60 mt-2">You're in!</p>
      </div>

      {/* Waiting Message */}
      <div className="bg-white/5 rounded-2xl p-8 text-center max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Waiting for Host</h2>
        <p className="text-white/60">
          The game will start soon. Look at the main screen!
        </p>
      </div>

      {/* Player Count */}
      <div className="mt-8 text-center">
        <p className="text-white/60">
          <span className="text-2xl font-bold text-white">{participants.length}</span>
          {' '}players in lobby
        </p>
      </div>

      {/* Other Players Preview */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm">
        {participants.slice(0, 8).map((p) => (
          <div
            key={p.id}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${p.id === participantId ? 'bg-primary' : 'bg-white/10'}
            `}
          >
            <span className="text-xl">
              {AVATARS.find((a) => a.id === p.avatar_base)?.emoji}
            </span>
          </div>
        ))}
        {participants.length > 8 && (
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm">
            +{participants.length - 8}
          </div>
        )}
      </div>

      {/* Game PIN reminder */}
      <div className="mt-8 bg-primary/20 rounded-lg px-4 py-2">
        <span className="text-white/60 text-sm">Game PIN: </span>
        <span className="text-white font-bold">{gamePin}</span>
      </div>
    </div>
  )
}
