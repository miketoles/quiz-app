import { SCORING } from '../lib/constants'

interface ScoreParams {
  basePoints: number
  timeLimitMs: number
  responseTimeMs: number
  speedScoring: boolean
  currentStreak: number
  isCorrect: boolean
  isWarmup?: boolean // Warmup questions don't count toward score
}

interface ScoreResult {
  points: number
  newStreak: number
  timeBonus: number
  streakBonus: number
  isWarmup: boolean // Indicates if this was a warmup question
}

export function calculateScore({
  basePoints,
  timeLimitMs,
  responseTimeMs,
  speedScoring,
  currentStreak,
  isCorrect,
  isWarmup = false,
}: ScoreParams): ScoreResult {
  // Warmup questions: no points, no streak changes
  // Players still see correct/incorrect feedback but it's "just for fun"
  if (isWarmup) {
    return {
      points: 0,
      newStreak: currentStreak, // Preserve streak - warmup doesn't affect it
      timeBonus: 0,
      streakBonus: 0,
      isWarmup: true,
    }
  }

  if (!isCorrect) {
    return {
      points: 0,
      newStreak: 0,
      timeBonus: 0,
      streakBonus: 0,
      isWarmup: false,
    }
  }

  let points = basePoints
  let timeBonus = 0

  // Time bonus (only if speed scoring enabled)
  if (speedScoring) {
    const timeRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs)
    // Fast answer = 100% of points, slow answer = 50% of points
    const timeFactor = SCORING.MIN_POINTS_RATIO + (1 - SCORING.MIN_POINTS_RATIO) * timeRatio
    points = Math.round(basePoints * timeFactor)
    timeBonus = points - Math.round(basePoints * SCORING.MIN_POINTS_RATIO)
  }

  // Streak bonus (always applies)
  const streakBonus = Math.min(
    currentStreak * SCORING.STREAK_BONUS_PER_CORRECT,
    SCORING.MAX_STREAK_BONUS
  )

  return {
    points: points + streakBonus,
    newStreak: currentStreak + 1,
    timeBonus,
    streakBonus,
    isWarmup: false,
  }
}

export function formatScore(score: number): string {
  return score.toLocaleString()
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const decimal = Math.floor((ms % 1000) / 100)
  return `${seconds}.${decimal}s`
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 5) return '🔥🔥🔥'
  if (streak >= 3) return '🔥🔥'
  if (streak >= 1) return '🔥'
  return ''
}

export function getRankSuffix(rank: number): string {
  if (rank === 1) return 'st'
  if (rank === 2) return 'nd'
  if (rank === 3) return 'rd'
  return 'th'
}
