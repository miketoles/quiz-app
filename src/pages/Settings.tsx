import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Toggle } from '../components/ui/Toggle'
import { DEFAULT_SETTINGS } from '../lib/constants'

export function Settings() {
  const { profile, settings, updateProfile, updateSettings } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile form
  const [displayName, setDisplayName] = useState('')

  // Quiz settings form
  const [timeLimit, setTimeLimit] = useState<number>(DEFAULT_SETTINGS.timeLimit)
  const [speedScoring, setSpeedScoring] = useState<boolean>(DEFAULT_SETTINGS.speedScoring)
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(DEFAULT_SETTINGS.pointsPerQuestion)
  const [autoAdvance, setAutoAdvance] = useState<boolean>(DEFAULT_SETTINGS.autoAdvance)

  // Load current settings
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
    }
    if (settings) {
      setTimeLimit(settings.default_time_limit)
      setSpeedScoring(settings.default_speed_scoring)
      setPointsPerQuestion(settings.default_points_per_question)
      setAutoAdvance(settings.default_auto_advance)
    }
  }, [profile, settings])

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage(null)

    const { error } = await updateProfile({ display_name: displayName })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }

    setSaving(false)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)

    const { error } = await updateSettings({
      default_time_limit: timeLimit,
      default_speed_scoring: speedScoring,
      default_points_per_question: pointsPerQuestion,
      default_auto_advance: autoAdvance,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    }

    setSaving(false)
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
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-success/20 border border-success/50 text-success'
                : 'bg-error/20 border border-error/50 text-error'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Settings */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-6">Profile</h2>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />

            <div className="text-white/60 text-sm">
              <strong>Email:</strong> {profile?.email}
            </div>

            <div className="text-white/60 text-sm">
              <strong>Role:</strong>{' '}
              <span className="px-2 py-0.5 bg-primary/30 rounded text-white">
                {profile?.role.toUpperCase()}
              </span>
            </div>

            <Button onClick={handleSaveProfile} isLoading={saving}>
              Save Profile
            </Button>
          </div>
        </Card>

        {/* Quiz Default Settings - Only for BCBAs */}
        {(profile?.role === 'bcba' || profile?.role === 'admin') && (
          <Card>
            <h2 className="text-xl font-bold text-white mb-2">Default Quiz Settings</h2>
            <p className="text-white/60 text-sm mb-6">
              These defaults will be applied when you create new quizzes. You can override them per-quiz.
            </p>

            <div className="space-y-6">
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

              <Button onClick={handleSaveSettings} isLoading={saving}>
                Save Quiz Settings
              </Button>
            </div>
          </Card>
        )}

        {/* About Section */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">About BIP Quiz</h2>
          <div className="text-white/60 text-sm space-y-2">
            <p>
              BIP Quiz is a training tool for BCBA/RBT teams to learn and review
              Behavior Intervention Plans through fun, competitive quizzes.
            </p>
            <p className="text-white/40 text-xs mt-4">
              Remember: Always use de-identified patient information (room + initials format like "301 AB").
              Never enter full patient names in quizzes.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
