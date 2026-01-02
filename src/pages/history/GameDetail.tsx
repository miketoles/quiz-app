import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/game/Avatar'
import { exportGameToCSV } from '../../utils/csvExport'
import type { GameSession, Quiz, GameParticipant, Question, QuestionOption, QuestionResponse } from '../../lib/database.types'

interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionId = id ?? ''

  const [session, setSession] = useState<GameSession | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [participants, setParticipants] = useState<GameParticipant[]>([])
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'questions'>('leaderboard')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (sessionId) {
      fetchGameDetails()
    }
  }, [sessionId])

  const fetchGameDetails = async () => {
    setLoading(true)

    // Fetch session
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      navigate('/history')
      return
    }

    setSession(sessionData)

    // Fetch quiz
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', sessionData.quiz_id)
      .single()

    setQuiz(quizData)

    // Fetch participants
    const { data: participantsData } = await supabase
      .from('game_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .order('total_score', { ascending: false })

    setParticipants(participantsData || [])

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

    // Fetch responses
    const { data: responsesData } = await supabase
      .from('question_responses')
      .select('*')
      .eq('game_session_id', sessionId)

    setResponses(responsesData || [])

    setLoading(false)
  }

  const handleExportCSV = async () => {
    if (!quiz || !questions.length) return

    setExporting(true)
    try {
      exportGameToCSV({
        quiz,
        session: session!,
        participants,
        questions,
        responses,
      })
    } catch (error) {
      console.error('Export error:', error)
    }
    setExporting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getResponsesForQuestion = (questionId: string) => {
    return responses.filter((r) => r.question_id === questionId)
  }

  const getParticipantResponse = (questionId: string, participantId: string) => {
    return responses.find(
      (r) => r.question_id === questionId && r.participant_id === participantId
    )
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

  if (!session || !quiz) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold text-white">Game not found</h2>
          <Link to="/history">
            <Button className="mt-4">Back to History</Button>
          </Link>
        </Card>
      </Layout>
    )
  }

  const totalCorrect = responses.filter((r) => r.is_correct).length
  const totalAnswers = responses.length
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/history" className="text-white/60 hover:text-white">
                History
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white">{quiz.title}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
            {quiz.patient_code && (
              <span className="inline-block mt-2 px-3 py-1 bg-primary/30 rounded-lg text-sm text-white">
                {quiz.patient_code}
              </span>
            )}
            <p className="text-white/60 mt-2">
              {formatDate(session.ended_at || session.created_at)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              isLoading={exporting}
            >
              Export CSV
            </Button>
            <Link to={`/host?quiz=${quiz.id}`}>
              <Button>Play Again</Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-white">{participants.length}</p>
            <p className="text-white/60 text-sm">Players</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-white">{questions.length}</p>
            <p className="text-white/60 text-sm">Questions</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{accuracy}%</p>
            <p className="text-white/60 text-sm">Accuracy</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-white">
              {participants[0]?.total_score || 0}
            </p>
            <p className="text-white/60 text-sm">Top Score</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'questions'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Questions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'leaderboard' ? (
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Final Standings</h2>
            <div className="space-y-2">
              {participants.map((participant, index) => {
                const correctAnswers = responses.filter(
                  (r) => r.participant_id === participant.id && r.is_correct
                ).length
                const totalQuestions = questions.filter((q) => !q.is_warmup).length

                return (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-500/20'
                        : index === 1
                        ? 'bg-gray-400/20'
                        : index === 2
                        ? 'bg-orange-700/20'
                        : 'bg-white/5'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-500 text-black'
                          : index === 1
                          ? 'bg-gray-400 text-black'
                          : index === 2
                          ? 'bg-orange-700 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Avatar
                      base={participant.avatar_base}
                      accessory={participant.avatar_accessory}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {participant.nickname}
                      </p>
                      <p className="text-white/60 text-sm">
                        {correctAnswers}/{totalQuestions} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-xl font-bold">
                        {participant.total_score}
                      </p>
                      <p className="text-white/60 text-xs">points</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, qIndex) => {
              const questionResponses = getResponsesForQuestion(question.id)
              const correctCount = questionResponses.filter((r) => r.is_correct).length

              return (
                <Card key={question.id}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {qIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {question.question_text}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {question.is_warmup && (
                          <span className="px-2 py-0.5 bg-answer-yellow/20 text-answer-yellow text-xs rounded-full">
                            Just for fun
                          </span>
                        )}
                        <span className="text-white/60 text-sm">
                          {correctCount}/{questionResponses.length} correct
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Options with results */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option) => {
                      const optionResponses = questionResponses.filter(
                        (r) => r.selected_option_id === option.id
                      )
                      const percentage =
                        questionResponses.length > 0
                          ? Math.round((optionResponses.length / questionResponses.length) * 100)
                          : 0

                      return (
                        <div
                          key={option.id}
                          className={`relative p-3 rounded-lg overflow-hidden ${
                            option.is_correct ? 'bg-success/20' : 'bg-white/5'
                          }`}
                        >
                          {/* Progress bar */}
                          <div
                            className={`absolute inset-0 ${
                              option.is_correct ? 'bg-success/10' : 'bg-white/5'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {option.is_correct && (
                                <span className="text-success">&#10003;</span>
                              )}
                              <span className="text-white">{option.option_text}</span>
                            </div>
                            <span className="text-white/60 text-sm">
                              {optionResponses.length} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Who answered what */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/60 text-sm mb-2">Player responses:</p>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((p) => {
                        const response = getParticipantResponse(question.id, p.id)
                        if (!response) return null

                        return (
                          <div
                            key={p.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              response.is_correct
                                ? 'bg-success/20 text-success'
                                : 'bg-error/20 text-error'
                            }`}
                          >
                            <Avatar base={p.avatar_base} size="sm" showAccessory={false} />
                            <span>{p.nickname}</span>
                            <span>{response.is_correct ? '&#10003;' : '&#10007;'}</span>
                          </div>
                        )
                      })}
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
