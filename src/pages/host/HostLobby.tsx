import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useGameStore } from '../../stores/gameStore'
import { GameQRCode } from '../../components/game/GameQRCode'
import { Avatar } from '../../components/game/Avatar'
import { Button } from '../../components/ui/Button'
import type { GameParticipant, Quiz } from '../../lib/database.types'

export function HostLobby() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gamePin = searchParams.get('pin') || ''

  const { startGame, endGame } = useGameStore()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [participants, setParticipants] = useState<GameParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (!gamePin) {
      navigate('/host')
      return
    }
    fetchGameData()
    setupRealtimeSubscription()
  }, [gamePin])

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

    // Fetch quiz details
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', sessionData.quiz_id)
      .single()

    setQuiz(quizData)
    setSessionId(sessionData.id)

    // Fetch existing participants
    const { data: participantsData } = await supabase
      .from('game_participants')
      .select('*')
      .eq('game_session_id', sessionData.id)
      .order('joined_at')

    setParticipants(participantsData || [])
    setLoading(false)
  }

  const setupRealtimeSubscription = async () => {
    // Get session ID first
    const { data: sessionData } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('game_pin', gamePin)
      .single()

    if (!sessionData) return
    setSessionId(sessionData.id)

    // Subscribe to new participants
    const channel = supabase
      .channel(`lobby-${sessionData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_participants',
          filter: `game_session_id=eq.${sessionData.id}`,
        },
        (payload) => {
          setParticipants((prev) => [...prev, payload.new as GameParticipant])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'game_participants',
          filter: `game_session_id=eq.${sessionData.id}`,
        },
        (payload) => {
          setParticipants((prev) =>
            prev.filter((p) => p.id !== (payload.old as GameParticipant).id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Fallback polling in case realtime misses events (mobile join hanging)
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('game_participants')
        .select('*')
        .eq('game_session_id', sessionId)
        .order('joined_at')

      if (data) setParticipants(data)
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  const handleStartGame = async () => {
    setStarting(true)
    await startGame()
    navigate(`/host/game?pin=${gamePin}`)
  }

  const handleCancelGame = async () => {
    if (confirm('Are you sure you want to cancel this game?')) {
      await endGame()
      navigate('/host')
    }
  }

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{quiz?.title}</h1>
          <p className="text-white/60">Waiting for players to join...</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCancelGame}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleStartGame}
            isLoading={starting}
            disabled={participants.length === 0}
          >
            Start Game ({participants.length} players)
          </Button>
        </div>
      </div>

      {/* Main Content - TV optimized */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* QR Code Section */}
        <div className="bg-white/5 rounded-2xl p-8 text-center">
          <p className="text-white/60 mb-4 text-lg">Scan to join</p>
          <GameQRCode gamePin={gamePin} size={280} />
          <div className="mt-6">
            <p className="text-white/60 text-sm">or go to</p>
            <p className="text-white text-xl font-bold mt-1">{window.location.origin}/join</p>
          </div>
          <div className="mt-6 bg-primary/30 rounded-xl p-4">
            <p className="text-white/60 text-sm">Game PIN</p>
            <p className="text-5xl font-bold text-white tracking-widest mt-1">{gamePin}</p>
          </div>
        </div>

        {/* Players Section */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white mb-4">
            Players ({participants.length})
          </h2>

          {participants.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center">
              <span className="text-4xl block mb-4">Waiting...</span>
              <p className="text-white/60">
                Players will appear here as they join
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="bg-white/5 rounded-xl p-4 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar
                    base={participant.avatar_base}
                    accessory={participant.avatar_accessory}
                    size="lg"
                  />
                  <p className="text-white font-medium mt-2 truncate">
                    {participant.nickname}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-white/60 text-sm">
            <span className="font-bold text-white">{participants.length}</span> players ready
          </div>
          <div className="text-white/40 text-sm">
            Press "Start Game" when all players have joined
          </div>
        </div>
      </div>
    </div>
  )
}
