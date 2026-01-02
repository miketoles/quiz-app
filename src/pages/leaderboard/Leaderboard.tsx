import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/game/Avatar'

interface LeaderboardEntry {
  nickname: string
  avatar_base: string
  avatar_accessory: string | null
  total_score: number
  games_played: number
  games_won: number
  best_score: number
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeRange])

  const fetchLeaderboard = async () => {
    setLoading(true)

    // Get date filter
    let dateFilter: string | null = null
    if (timeRange === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = weekAgo.toISOString()
    } else if (timeRange === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = monthAgo.toISOString()
    }

    // Fetch finished game sessions
    let sessionsQuery = supabase
      .from('game_sessions')
      .select('id, ended_at')
      .eq('status', 'finished')

    if (dateFilter) {
      sessionsQuery = sessionsQuery.gte('ended_at', dateFilter)
    }

    const { data: sessions } = await sessionsQuery

    if (!sessions?.length) {
      setEntries([])
      setLoading(false)
      return
    }

    const sessionIds = sessions.map((s) => s.id)

    // Fetch all participants from these sessions
    const { data: participants } = await supabase
      .from('game_participants')
      .select('*')
      .in('game_session_id', sessionIds)

    if (!participants?.length) {
      setEntries([])
      setLoading(false)
      return
    }

    // Aggregate by nickname (simple approach - could be improved with real user tracking)
    const aggregated = new Map<string, LeaderboardEntry>()

    for (const p of participants) {
      const existing = aggregated.get(p.nickname)

      if (existing) {
        existing.total_score += p.total_score
        existing.games_played += 1
        existing.best_score = Math.max(existing.best_score, p.total_score)
        // Update avatar to most recent
        existing.avatar_base = p.avatar_base
        existing.avatar_accessory = p.avatar_accessory
      } else {
        aggregated.set(p.nickname, {
          nickname: p.nickname,
          avatar_base: p.avatar_base,
          avatar_accessory: p.avatar_accessory,
          total_score: p.total_score,
          games_played: 1,
          games_won: 0,
          best_score: p.total_score,
        })
      }
    }

    // Calculate wins (need to check who won each game)
    for (const sessionId of sessionIds) {
      const sessionParticipants = participants.filter(
        (p) => p.game_session_id === sessionId
      )
      if (sessionParticipants.length > 0) {
        const winner = sessionParticipants.reduce((prev, curr) =>
          curr.total_score > prev.total_score ? curr : prev
        )
        const entry = aggregated.get(winner.nickname)
        if (entry) {
          entry.games_won += 1
        }
      }
    }

    // Sort by total score
    const sorted = Array.from(aggregated.values()).sort(
      (a, b) => b.total_score - a.total_score
    )

    setEntries(sorted)
    setLoading(false)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-white/60 mt-1">Top players across all games</p>
          </div>

          {/* Time Range Filter */}
          <div className="flex gap-2">
            {(['all', 'month', 'week'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Week'}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-white/60 mt-4">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card className="text-center py-12">
            <span className="text-5xl block mb-4">trophy</span>
            <h2 className="text-xl font-bold text-white">No games yet</h2>
            <p className="text-white/60 mt-2">
              Play some games to see the leaderboard
            </p>
          </Card>
        ) : (
          <>
            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8 h-64">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="bg-gray-400/20 rounded-t-2xl p-4 w-32 text-center">
                    <Avatar
                      base={entries[1].avatar_base}
                      accessory={entries[1].avatar_accessory}
                      size="lg"
                    />
                    <p className="text-white font-bold mt-2 truncate">
                      {entries[1].nickname}
                    </p>
                    <p className="text-primary font-bold">
                      {entries[1].total_score}
                    </p>
                  </div>
                  <div className="bg-gray-400 w-32 h-20 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/80">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -mt-8">
                  <div className="bg-yellow-500/20 rounded-t-2xl p-4 w-40 text-center border-2 border-yellow-500">
                    <span className="text-3xl">crown</span>
                    <Avatar
                      base={entries[0].avatar_base}
                      accessory={entries[0].avatar_accessory}
                      size="xl"
                    />
                    <p className="text-white font-bold text-lg mt-2 truncate">
                      {entries[0].nickname}
                    </p>
                    <p className="text-primary text-xl font-bold">
                      {entries[0].total_score}
                    </p>
                  </div>
                  <div className="bg-yellow-500 w-40 h-28 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="bg-orange-700/20 rounded-t-2xl p-4 w-28 text-center">
                    <Avatar
                      base={entries[2].avatar_base}
                      accessory={entries[2].avatar_accessory}
                      size="md"
                    />
                    <p className="text-white font-bold mt-2 truncate text-sm">
                      {entries[2].nickname}
                    </p>
                    <p className="text-primary font-bold">
                      {entries[2].total_score}
                    </p>
                  </div>
                  <div className="bg-orange-700 w-28 h-16 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white/80">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-medium">Rank</th>
                      <th className="text-left py-3 px-4 text-white/60 font-medium">Player</th>
                      <th className="text-right py-3 px-4 text-white/60 font-medium">Total Score</th>
                      <th className="text-right py-3 px-4 text-white/60 font-medium">Games</th>
                      <th className="text-right py-3 px-4 text-white/60 font-medium">Wins</th>
                      <th className="text-right py-3 px-4 text-white/60 font-medium">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr
                        key={entry.nickname}
                        className={`border-b border-white/5 ${
                          index < 3 ? 'bg-white/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0
                                ? 'bg-yellow-500 text-black'
                                : index === 1
                                ? 'bg-gray-400 text-black'
                                : index === 2
                                ? 'bg-orange-700 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              base={entry.avatar_base}
                              accessory={entry.avatar_accessory}
                              size="sm"
                            />
                            <span className="text-white font-medium">
                              {entry.nickname}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-primary font-bold">
                          {entry.total_score.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {entry.games_played}
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {entry.games_won}
                        </td>
                        <td className="py-3 px-4 text-right text-white/60">
                          {entry.best_score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  )
}
