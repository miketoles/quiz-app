import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
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

  const isBCBA = profile?.role === 'bcba' || profile?.role === 'admin'

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
      quiz.patient_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              {isBCBA ? 'Create and manage your quizzes' : 'Browse available quizzes'}
            </p>
          </div>

          {isBCBA && (
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
                  {isBCBA
                    ? 'Create your first quiz to get started!'
                    : 'No quizzes have been created yet.'}
                </p>
                {isBCBA && (
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
                isBCBA={isBCBA}
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
  isBCBA: boolean
  onRefresh: () => void
}

function QuizCard({ quiz, isBCBA, onRefresh }: QuizCardProps) {
  const [deleting, setDeleting] = useState(false)
  const { profile } = useAuthStore()
  const isOwner = profile?.id === quiz.creator_id

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id)

    if (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz')
    } else {
      onRefresh()
    }
    setDeleting(false)
  }

  return (
    <Card className="flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-white line-clamp-2">{quiz.title}</h3>
          {quiz.patient_code && (
            <span className="shrink-0 px-2 py-0.5 bg-primary/30 rounded text-xs text-white/80">
              {quiz.patient_code}
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
        {isBCBA && (
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
            <Button
              variant="ghost"
              onClick={handleDelete}
              isLoading={deleting}
              className="text-error hover:bg-error/20"
            >
              Delete
            </Button>
          </>
        )}

        {!isBCBA && (
          <div className="text-white/40 text-sm">
            Ask a BCBA to host this quiz
          </div>
        )}
      </div>
    </Card>
  )
}
