// Avatar options
export const AVATARS = [
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'koala', emoji: '🐨', name: 'Koala' },
] as const

export const ACCESSORIES = [
  { id: 'none', emoji: '', name: 'None' },
  { id: 'glasses', emoji: '👓', name: 'Glasses' },
  { id: 'sunglasses', emoji: '🕶️', name: 'Sunglasses' },
  { id: 'tophat', emoji: '🎩', name: 'Top Hat' },
  { id: 'cap', emoji: '🧢', name: 'Cap' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'bow', emoji: '🎀', name: 'Bow' },
  { id: 'headphones', emoji: '🎧', name: 'Headphones' },
] as const

// Answer button colors (Kahoot-style)
export const ANSWER_COLORS = [
  { id: 0, color: 'answer-red', icon: '🔺', name: 'Red' },
  { id: 1, color: 'answer-blue', icon: '🔷', name: 'Blue' },
  { id: 2, color: 'answer-yellow', icon: '⭕', name: 'Yellow' },
  { id: 3, color: 'answer-green', icon: '🟩', name: 'Green' },
] as const

// Default quiz settings
export const DEFAULT_SETTINGS = {
  timeLimit: 20, // seconds
  speedScoring: true,
  pointsPerQuestion: 1000,
  autoAdvance: false,
} as const

// Time limit options
export const TIME_LIMIT_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const

// Game statuses
export const GAME_STATUS = {
  LOBBY: 'lobby',
  ACTIVE: 'active',
  QUESTION: 'question',
  RESULTS: 'results',
  FINISHED: 'finished',
} as const

// Scoring constants
export const SCORING = {
  MAX_STREAK_BONUS: 500,
  STREAK_BONUS_PER_CORRECT: 100,
  MIN_POINTS_RATIO: 0.5, // Minimum 50% of points for slowest correct answer
} as const
