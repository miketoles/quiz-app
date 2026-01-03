import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useGuestStore } from '../../stores/guestStore'
import { config } from '../../lib/config'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Quiz } from '../../lib/database.types'

export function QuizList() {
  const { profile } = useAuthStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // In guest mode, everyone can create/host. In auth mode, only BCBAs/admins.
  const canCreate = !config.authRequired || profile?.role === 'bcba' || profile?.role === 'admin'

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching quizzes:', error)
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Quizzes</h1>
            <p className="text-white/60 mt-1">
              {canCreate ? 'Create and manage your quizzes' : 'Browse available quizzes'}
            </p>
          </div>

          {canCreate && (
            <Link to="/quizzes/create">
              <Button size="lg">
                + Create Quiz
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-white/60 mt-4">Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="text-center py-12">
            <span className="text-5xl block mb-4">📚</span>
            {searchTerm ? (
              <>
                <h2 className="text-xl font-bold text-white">No quizzes found</h2>
                <p className="text-white/60 mt-2">
                  Try adjusting your search term
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">No quizzes yet</h2>
                <p className="text-white/60 mt-2">
                  {canCreate
                    ? 'Create your first quiz to get started!'
                    : 'No quizzes have been created yet.'}
                </p>
                {canCreate && (
                  <Link to="/quizzes/create" className="inline-block mt-4">
                    <Button>Create Quiz</Button>
                  </Link>
                )}
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                canHost={canCreate}
                onRefresh={fetchQuizzes}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

interface QuizCardProps {
  quiz: Quiz
  canHost: boolean
  onRefresh: () => void
}

function QuizCard({ quiz, canHost, onRefresh }: QuizCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  const { profile } = useAuthStore()
  const { guestId, guestName } = useGuestStore()
  // Owner check: match profile id OR guest id with creator_id
  // Consider guest-created quizzes (creator_id null) as deletable by current user
  const isOwner =
    !config.authRequired ||
    quiz.creator_id === null ||
    (profile?.id && profile.id === quiz.creator_id) ||
    (guestId && guestId === quiz.creator_id)

  useEffect(() => {
    const checkHistory = async () => {
      const { data } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('quiz_id', quiz.id)
        .limit(1)
      setHasHistory(!!data?.length)
    }
    void checkHistory()
  }, [quiz.id])

  const handleDelete = async () => {
    if (!confirm('Delete this quiz? This cannot be undone.')) {
      return
    }

    if (hasHistory) {
      alert('This quiz has already been played and cannot be deleted. Duplicate it to run again.')
      return
    }

    setDeleting(true)
    try {
      // Clean up related game data first (game_sessions → participants/responses)
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('quiz_id', quiz.id)

      const sessionIds = (sessions || []).map((s) => s.id)

      if (sessionIds.length) {
        // Delete responses
        await supabase.from('question_responses').delete().in('game_session_id', sessionIds)
        // Delete participants
        await supabase.from('game_participants').delete().in('game_session_id', sessionIds)
        // Delete sessions
        await supabase.from('game_sessions').delete().in('id', sessionIds)
      }

      const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id)
      if (error) throw error
      onRefresh()
    } catch (err) {
      console.error('Error deleting quiz:', err)
      alert('Failed to delete quiz')
    }

    setDeleting(false)
  }

  const handleDuplicate = async () => {
    setDuplicating(true)
    try {
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index')

      const questionIds = (questions || []).map((q) => q.id)
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('order_index')

      const { data: newQuiz, error: insertQuizError } = await supabase
        .from('quizzes')
        .insert({
          title: `${quiz.title} (copy)`,
          description: quiz.description,
          creator_id: profile?.id || null,
          creator_name: profile?.display_name || guestName || quiz.creator_name || 'Anonymous',
          organization_id: quiz.organization_id || profile?.organization_id || null,
          time_limit: quiz.time_limit,
          speed_scoring: quiz.speed_scoring,
          points_per_question: quiz.points_per_question,
          auto_advance: quiz.auto_advance,
          is_active: quiz.is_active,
        })
        .select()
        .single()

      if (insertQuizError || !newQuiz) throw insertQuizError

      const { data: newQuestions } = await supabase
        .from('questions')
        .insert(
          (questions || []).map((q) => ({
            quiz_id: newQuiz.id,
            type: q.type,
            question_text: q.question_text,
            order_index: q.order_index,
            time_limit_override: q.time_limit_override,
            is_warmup: (q as any).is_warmup ?? false,
          }))
        )
        .select()

      const idMap: Record<string, string> = {}
      newQuestions?.forEach((nq) => {
        const match = (questions || []).find((q) => q.order_index === nq.order_index)
        if (match) idMap[match.id] = nq.id
      })

      if (options?.length) {
        await supabase.from('question_options').insert(
          options.map((o) => ({
            question_id: idMap[o.question_id],
            option_text: o.option_text,
            is_correct: o.is_correct,
            order_index: o.order_index,
          }))
        )
      }

      onRefresh()
      alert('Quiz duplicated. You can edit or delete the new copy.')
    } catch (err) {
      console.error('Error duplicating quiz:', err)
      alert('Failed to duplicate quiz')
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-white line-clamp-2">{quiz.title}</h3>
          {hasHistory && (
            <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70">
              Played
            </span>
          )}
        </div>

        {quiz.description && (
          <p className="text-white/60 text-sm mt-2 line-clamp-2">{quiz.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4 text-xs text-white/50">
          <span>{quiz.time_limit}s per question</span>
          <span>•</span>
          <span>{quiz.points_per_question} pts</span>
          {quiz.speed_scoring && (
            <>
              <span>•</span>
              <span>Speed scoring</span>
            </>
          )}
        </div>

        <div className="text-xs text-white/40 mt-2">
          Updated {new Date(quiz.updated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
        {canHost && (
          <Link to={`/host?quiz=${quiz.id}`} className="flex-1">
            <Button className="w-full" variant="primary">
              Host
            </Button>
          </Link>
        )}

        {isOwner && (
          <>
            <Link to={`/quizzes/${quiz.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            {hasHistory && (
              <Button
                variant="secondary"
                onClick={handleDuplicate}
                isLoading={duplicating}
              >
                Duplicate
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleDelete}
              isLoading={deleting}
              className={`text-error hover:bg-error/20 ${hasHistory ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={hasHistory}
            >
              Delete
            </Button>
          </>
        )}

        {!canHost && (
          <div className="text-white/40 text-sm">
            You can host this quiz from the Home screen
          </div>
        )}
      </div>
    </Card>
  )
}
