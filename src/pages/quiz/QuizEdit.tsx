import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Toggle } from '../../components/ui/Toggle'
import { QuestionEditor } from '../../components/quiz/QuestionEditor'
import type { Quiz, Question, QuestionOption } from '../../lib/database.types'

type QuestionWithOptions = Question & { options: QuestionOption[] }

export function QuizEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const quizId = id ?? ''
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Quiz data
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])

  // Quiz form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(20)
  const [speedScoring, setSpeedScoring] = useState(true)
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1000)
  const [autoAdvance, setAutoAdvance] = useState(false)

  // Track unsaved changes per question
  const [unsavedQuestions, setUnsavedQuestions] = useState<Set<string>>(new Set())
  const [savingQuestions, setSavingQuestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
    }
  }, [quizId])

  const fetchQuiz = async () => {
    setLoading(true)

    // Fetch quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()

    if (quizError) {
      setError('Quiz not found')
      setLoading(false)
      return
    }

    setQuiz(quizData)
    setTitle(quizData.title)
    setDescription(quizData.description || '')
    setTimeLimit(quizData.time_limit)
    setSpeedScoring(quizData.speed_scoring)
    setPointsPerQuestion(quizData.points_per_question)
    setAutoAdvance(quizData.auto_advance)

    // Fetch questions
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index')

    // Fetch options for all questions
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
    setLoading(false)
  }

  const handleSaveQuiz = async () => {
    setError('')
    setSuccessMessage('')

    if (!title.trim()) {
      setError('Please enter a quiz title')
      return
    }

    setSaving(true)

    const { error: updateError } = await supabase
      .from('quizzes')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        time_limit: timeLimit,
        speed_scoring: speedScoring,
        points_per_question: pointsPerQuestion,
        auto_advance: autoAdvance,
      })
      .eq('id', quizId)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccessMessage('Quiz saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    setSaving(false)
  }

  const handleAddQuestion = async () => {
    const newOrderIndex = questions.length

    const { data, error: insertError } = await supabase
      .from('questions')
      .insert({
        quiz_id: quizId,
        question_text: '',
        type: 'multiple_choice' as const,
        order_index: newOrderIndex,
        is_warmup: false,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    // Add default options for multiple choice
    const defaultOptions = [
      { question_id: data.id, option_text: 'Option A', is_correct: true, order_index: 0 },
      { question_id: data.id, option_text: 'Option B', is_correct: false, order_index: 1 },
      { question_id: data.id, option_text: 'Option C', is_correct: false, order_index: 2 },
      { question_id: data.id, option_text: 'Option D', is_correct: false, order_index: 3 },
    ]

    const { data: optionsData } = await supabase
      .from('question_options')
      .insert(defaultOptions)
      .select()

    setQuestions([...questions, { ...data, options: optionsData || [] }])
  }

  const handleAddOption = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const nextIndex = question.options.length
    // For multiple choice we cap at 4 options
    if (nextIndex >= 4) return

    const makeCorrect = !question.options.some((o) => o.is_correct)

    const { data, error } = await supabase
      .from('question_options')
      .insert({
        question_id: questionId,
        option_text: '',
        is_correct: makeCorrect,
        order_index: nextIndex,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }

    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, data] } : q
      )
    )
    setUnsavedQuestions((prev) => new Set(prev).add(questionId))
  }

  const handleUpdateQuestion = (
    questionId: string,
    updates: Partial<Question>
  ) => {
    // Update local state only (no database update)
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    )

    // Mark as unsaved
    setUnsavedQuestions((prev) => new Set(prev).add(questionId))
  }

  const handleSaveQuestion = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    setSavingQuestions((prev) => new Set(prev).add(questionId))
    setError('')

    try {
      // Save question
      const { error: questionError } = await supabase
        .from('questions')
        .update({
          question_text: question.question_text,
          type: question.type,
          is_warmup: question.is_warmup,
        })
        .eq('id', questionId)

      if (questionError) throw questionError

      // Save all options for this question
      await Promise.all(
        question.options.map((option) =>
          supabase
            .from('question_options')
            .update({
              option_text: option.option_text,
              is_correct: option.is_correct,
            })
            .eq('id', option.id)
        )
      )

      // Mark as saved
      setUnsavedQuestions((prev) => {
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setSavingQuestions((prev) => {
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return

    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    const updatedQuestions = questions.filter((q) => q.id !== questionId)

    // Update order indices
    for (let i = 0; i < updatedQuestions.length; i++) {
      if (updatedQuestions[i].order_index !== i) {
        await supabase
          .from('questions')
          .update({ order_index: i })
          .eq('id', updatedQuestions[i].id)
        updatedQuestions[i].order_index = i
      }
    }

    setQuestions(updatedQuestions)
  }

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const index = questions.findIndex((q) => q.id === questionId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    const newQuestions = [...questions]
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[newIndex]
    newQuestions[newIndex] = temp

    // Update order indices
    await Promise.all([
      supabase.from('questions').update({ order_index: index }).eq('id', newQuestions[index].id),
      supabase.from('questions').update({ order_index: newIndex }).eq('id', newQuestions[newIndex].id),
    ])

    newQuestions[index].order_index = index
    newQuestions[newIndex].order_index = newIndex

    setQuestions(newQuestions)
  }

  const handleUpdateOption = (
    questionId: string,
    optionId: string,
    updates: Partial<QuestionOption>
  ) => {
    // Update local state only (no database update)
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.map((o) =>
            o.id === optionId ? { ...o, ...updates } : o
          ),
        }
      })
    )

    // Mark question as unsaved
    setUnsavedQuestions((prev) => new Set(prev).add(questionId))
  }

  const handleSetCorrectOption = (questionId: string, optionId: string) => {
    // Update local state only (no database update)
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.map((o) => ({
            ...o,
            is_correct: o.id === optionId,
          })),
        }
      })
    )

    // Mark question as unsaved
    setUnsavedQuestions((prev) => new Set(prev).add(questionId))
  }

  const timeLimitOptions = [
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 20, label: '20 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 45, label: '45 seconds' },
    { value: 60, label: '60 seconds' },
  ]

  const pointsOptions = [
    { value: 500, label: '500 points' },
    { value: 1000, label: '1000 points' },
    { value: 1500, label: '1500 points' },
    { value: 2000, label: '2000 points' },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!quiz) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold text-white">Quiz not found</h2>
          <Button className="mt-4" onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Quiz</h1>
            <p className="text-white/60 mt-1">{questions.length} questions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/quizzes')}>
              Back
            </Button>
            <Button onClick={handleSaveQuiz} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-success/20 border border-success/50 text-success px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Quiz Details */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-6">Quiz Details</h2>
          <div className="space-y-4">
            <Input
              label="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Select
                label="Time Limit"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                options={timeLimitOptions}
              />
              <Select
                label="Points"
                value={pointsPerQuestion}
                onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
                options={pointsOptions}
              />
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Speed Scoring
                </label>
                <Toggle
                  label=""
                  checked={speedScoring}
                  onChange={setSpeedScoring}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Auto-Advance
                </label>
                <Toggle
                  label=""
                  checked={autoAdvance}
                  onChange={setAutoAdvance}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Questions</h2>
            <Button onClick={handleAddQuestion}>+ Add Question</Button>
          </div>

          {questions.length === 0 ? (
            <Card className="text-center py-8">
              <span className="text-4xl block mb-4">📝</span>
              <p className="text-white/60">No questions yet</p>
              <Button className="mt-4" onClick={handleAddQuestion}>
                Add Your First Question
              </Button>
            </Card>
          ) : (
            questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                onDelete={() => handleDeleteQuestion(question.id)}
                onMoveUp={() => handleMoveQuestion(question.id, 'up')}
                onMoveDown={() => handleMoveQuestion(question.id, 'down')}
                onUpdateOption={(optionId, updates) =>
                  handleUpdateOption(question.id, optionId, updates)
                }
                onAddOption={() => handleAddOption(question.id)}
                onSetCorrectOption={(optionId) =>
                  handleSetCorrectOption(question.id, optionId)
                }
                onSave={() => handleSaveQuestion(question.id)}
                hasUnsavedChanges={unsavedQuestions.has(question.id)}
                isSaving={savingQuestions.has(question.id)}
              />
            ))
          )}

          {questions.length > 0 && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAddQuestion}
            >
              + Add Another Question
            </Button>
          )}
        </div>
      </div>
    </Layout>
  )
}
