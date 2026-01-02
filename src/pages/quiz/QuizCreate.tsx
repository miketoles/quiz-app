import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useGuestStore } from '../../stores/guestStore'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Toggle } from '../../components/ui/Toggle'
import { DEFAULT_SETTINGS } from '../../lib/constants'

export function QuizCreate() {
  const navigate = useNavigate()
  const { profile, settings } = useAuthStore()
  const { guestName } = useGuestStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Quiz form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Settings (use user defaults or system defaults)
  const [timeLimit, setTimeLimit] = useState<number>(
    settings?.default_time_limit ?? DEFAULT_SETTINGS.timeLimit
  )
  const [speedScoring, setSpeedScoring] = useState<boolean>(
    settings?.default_speed_scoring ?? DEFAULT_SETTINGS.speedScoring
  )
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(
    settings?.default_points_per_question ?? DEFAULT_SETTINGS.pointsPerQuestion
  )
  const [autoAdvance, setAutoAdvance] = useState<boolean>(
    settings?.default_auto_advance ?? DEFAULT_SETTINGS.autoAdvance
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a quiz title')
      return
    }

    setSaving(true)

    // Get creator name - use profile if logged in, otherwise guest name
    // creator_id must be null for guests (it's a UUID foreign key to profiles)
    const creatorName = profile?.display_name || guestName || 'Anonymous'
    const creatorId = profile?.id || null

    const { data, error: createError } = await supabase
      .from('quizzes')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        creator_id: creatorId,
        creator_name: creatorName,
        organization_id: profile?.organization_id || null,
        time_limit: timeLimit,
        speed_scoring: speedScoring,
        points_per_question: pointsPerQuestion,
        auto_advance: autoAdvance,
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setSaving(false)
      return
    }

    // Navigate to edit page to add questions
    navigate(`/quizzes/${data.id}/edit`)
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Quiz</h1>
          <p className="text-white/60 mt-2">
            Set up your quiz details, then add questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Quiz Details</h2>
            <div className="space-y-4">
              <Input
                label="Quiz Title"
                placeholder="e.g., Weekly Team Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Textarea
                label="Description (optional)"
                placeholder="Brief description of this quiz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </Card>

          {/* Quiz Settings */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-2">Quiz Settings</h2>
            <p className="text-white/60 text-sm mb-6">
              These settings apply to all questions in this quiz
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Time Limit per Question"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  options={timeLimitOptions}
                />

                <Select
                  label="Points per Question"
                  value={pointsPerQuestion}
                  onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
                  options={pointsOptions}
                />
              </div>

              <div className="space-y-4">
                <Toggle
                  label="Speed Scoring"
                  description="Faster answers earn more points"
                  checked={speedScoring}
                  onChange={setSpeedScoring}
                />

                <Toggle
                  label="Auto-Advance Questions"
                  description="Automatically move to next question after showing results"
                  checked={autoAdvance}
                  onChange={setAutoAdvance}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/quizzes')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} className="flex-1">
              Create Quiz & Add Questions
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
