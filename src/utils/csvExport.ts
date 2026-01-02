import type { Quiz, GameSession, GameParticipant, Question, QuestionOption, QuestionResponse } from '../lib/database.types'

interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}

interface ExportData {
  quiz: Quiz
  session: GameSession
  participants: GameParticipant[]
  questions: QuestionWithOptions[]
  responses: QuestionResponse[]
}

export function exportGameToCSV(data: ExportData): void {
  const { quiz, session, participants, questions, responses } = data

  // Create CSV header
  const headers = [
    'Quiz Title',
    'Patient Code',
    'Date',
    'Player',
    'Final Score',
    'Final Place',
    'Question #',
    'Question Type',
    'Question Text',
    'Player Answer',
    'Correct Answer',
    'Is Correct',
    'Points Awarded',
    'Response Time (ms)',
    'Is Warmup',
  ]

  // Create rows
  const rows: string[][] = []

  // Sort participants by score for ranking
  const sortedParticipants = [...participants].sort(
    (a, b) => b.total_score - a.total_score
  )

  // Create a row for each participant's response to each question
  for (const participant of participants) {
    const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1

    for (const question of questions) {
      const response = responses.find(
        (r) => r.participant_id === participant.id && r.question_id === question.id
      )

      const correctOption = question.options.find((o) => o.is_correct)
      const selectedOption = response
        ? question.options.find((o) => o.id === response.selected_option_id)
        : null

      const row = [
        quiz.title,
        quiz.patient_code || '',
        formatDateForCSV(session.ended_at || session.created_at),
        participant.nickname,
        participant.total_score.toString(),
        rank.toString(),
        (question.order_index + 1).toString(),
        question.type,
        question.question_text,
        selectedOption?.option_text || 'No answer',
        correctOption?.option_text || '',
        response?.is_correct ? 'Yes' : 'No',
        response?.points_awarded?.toString() || '0',
        response?.response_time_ms?.toString() || '',
        question.is_warmup ? 'Yes' : 'No',
      ]

      rows.push(row)
    }
  }

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n')

  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const filename = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}_${formatDateForFilename(
    session.ended_at || session.created_at
  )}.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function escapeCSVField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

function formatDateForCSV(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatDateForFilename(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

// Export summary CSV (leaderboard only)
export function exportLeaderboardToCSV(
  participants: GameParticipant[],
  quizTitle: string
): void {
  const headers = ['Rank', 'Nickname', 'Total Score', 'Current Streak']

  const sortedParticipants = [...participants].sort(
    (a, b) => b.total_score - a.total_score
  )

  const rows = sortedParticipants.map((p, index) => [
    (index + 1).toString(),
    p.nickname,
    p.total_score.toString(),
    p.current_streak.toString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${quizTitle.replace(/[^a-z0-9]/gi, '_')}_leaderboard.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
