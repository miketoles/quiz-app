import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/game/Avatar'
import type { GameSession, Quiz, GameParticipant } from '../../lib/database.types'

interface GameSessionWithDetails extends GameSession {
  quiz?: Quiz
  participants?: GameParticipant[]
  participant_count?: number
}

export function GameHistory() {
  const [sessions, setSessions] = useState<GameSessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGameHistory()
  }, [])

  const fetchGameHistory = async () => {
    setLoading(true)

    // Fetch finished game sessions
    const { data: sessionsData, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('status', 'finished')
      .order('ended_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching game history:', error)
      setLoading(false)
      return
    }

    // Fetch quiz details for each session
    const quizIds = [...new Set((sessionsData || []).map((s) => s.quiz_id))]
    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*')
      .in('id', quizIds)

    // Fetch participant counts
    const sessionIds = (sessionsData || []).map((s) => s.id)
    const { data: participantsData } = await supabase
      .from('game_participants')
      .select('*')
      .in('game_session_id', sessionIds)

    // Combine data
    const sessionsWithDetails = (sessionsData || []).map((session) => ({
      ...session,
      quiz: quizzesData?.find((q) => q.id === session.quiz_id),
      participants: participantsData?.filter((p) => p.game_session_id === session.id) || [],
      participant_count: participantsData?.filter((p) => p.game_session_id === session.id).length || 0,
    }))

    setSessions(sessionsWithDetails)
    setLoading(false)
  }

  const filteredSessions = sessions.filter((session) => {
    const quizTitle = session.quiz?.title?.toLowerCase() || ''
    const patientCode = session.quiz?.patient_code?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return quizTitle.includes(search) || patientCode.includes(search)
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getWinner = (participants: GameParticipant[]) => {
    if (!participants.length) return null
    return participants.reduce((prev, curr) =>
      curr.total_score > prev.total_score ? curr : prev
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Game History</h1>
            <p className="text-white/60 mt-1">
              View past quiz sessions and detailed results
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Search by quiz title or patient code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Game Sessions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-white/60 mt-4">Loading game history...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="text-center py-12">
            <span className="text-5xl block mb-4">📊</span>
            {searchTerm ? (
              <>
                <h2 className="text-xl font-bold text-white">No games found</h2>
                <p className="text-white/60 mt-2">Try adjusting your search term</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">No games yet</h2>
                <p className="text-white/60 mt-2">
                  Host your first quiz to see game history here
                </p>
                <Link to="/host">
                  <Button className="mt-4">Host a Game</Button>
                </Link>
              </>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const winner = getWinner(session.participants || [])
              return (
                <Card key={session.id} className="hover:bg-white/5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Quiz Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {session.quiz?.title || 'Unknown Quiz'}
                        </h3>
                        {session.quiz?.patient_code && (
                          <span className="shrink-0 px-2 py-0.5 bg-primary/30 rounded text-xs text-white/80">
                            {session.quiz.patient_code}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm mt-1">
                        {formatDate(session.ended_at || session.created_at)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {session.participant_count}
                        </p>
                        <p className="text-white/60 text-xs">Players</p>
                      </div>

                      {winner && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            base={winner.avatar_base}
                            accessory={winner.avatar_accessory}
                            size="sm"
                          />
                          <div className="text-left">
                            <p className="text-white font-medium text-sm truncate max-w-[100px]">
                              {winner.nickname}
                            </p>
                            <p className="text-primary text-xs font-bold">
                              {winner.total_score} pts
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/history/${session.id}`}>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
