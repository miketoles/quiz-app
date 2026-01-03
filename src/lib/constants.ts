// Accessory position offsets per avatar
// Positions are percentages relative to avatar container
// Each avatar may need slightly different positions based on face shape
type AccessoryPosition = {
  top: string
  left?: string
  right?: string
  transform?: string
}

type AccessoryPositions = {
  glasses: AccessoryPosition
  sunglasses: AccessoryPosition
  tophat: AccessoryPosition
  cap: AccessoryPosition
  crown: AccessoryPosition
  bow: AccessoryPosition
  headphones: AccessoryPosition
}

// Default positions - most avatars can use these
const defaultPositions: AccessoryPositions = {
  glasses: { top: '38%', left: '50%', transform: 'translateX(-50%)' },
  sunglasses: { top: '36%', left: '50%', transform: 'translateX(-50%)' },
  tophat: { top: '-8%', left: '50%', transform: 'translateX(-50%)' },
  cap: { top: '-2%', left: '50%', transform: 'translateX(-50%)' },
  crown: { top: '-5%', left: '50%', transform: 'translateX(-50%)' },
  bow: { top: '5%', right: '0%' },
  headphones: { top: '25%', left: '50%', transform: 'translateX(-50%)' },
}

// Avatar options with image paths and accessory positions
export const AVATARS = [
  {
    id: 'fox',
    emoji: '🦊',
    name: 'Fox',
    image: '/avatars/fox.png',
    accessoryPositions: { ...defaultPositions },
  },
  {
    id: 'owl',
    emoji: '🦉',
    name: 'Owl',
    image: '/avatars/owl.png',
    accessoryPositions: {
      ...defaultPositions,
      glasses: { top: '42%', left: '50%', transform: 'translateX(-50%)' },
      sunglasses: { top: '40%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
  {
    id: 'bear',
    emoji: '🐻',
    name: 'Bear',
    image: '/avatars/bear.png',
    accessoryPositions: {
      ...defaultPositions,
      tophat: { top: '-5%', left: '50%', transform: 'translateX(-50%)' },
      cap: { top: '0%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
  {
    id: 'cat',
    emoji: '🐱',
    name: 'Cat',
    image: '/avatars/cat.png',
    accessoryPositions: { ...defaultPositions },
  },
  {
    id: 'dog',
    emoji: '🐶',
    name: 'Dog',
    image: '/avatars/dog.png',
    accessoryPositions: {
      ...defaultPositions,
      glasses: { top: '42%', left: '50%', transform: 'translateX(-50%)' },
      sunglasses: { top: '40%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
  {
    id: 'rabbit',
    emoji: '🐰',
    name: 'Rabbit',
    image: '/avatars/rabbit.png',
    accessoryPositions: {
      ...defaultPositions,
      tophat: { top: '-12%', left: '50%', transform: 'translateX(-50%)' },
      crown: { top: '-10%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
  {
    id: 'panda',
    emoji: '🐼',
    name: 'Panda',
    image: '/avatars/panda.png',
    accessoryPositions: { ...defaultPositions },
  },
  {
    id: 'lion',
    emoji: '🦁',
    name: 'Lion',
    image: '/avatars/lion.png',
    accessoryPositions: {
      ...defaultPositions,
      tophat: { top: '-3%', left: '50%', transform: 'translateX(-50%)' },
      headphones: { top: '20%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
  {
    id: 'penguin',
    emoji: '🐧',
    name: 'Penguin',
    image: '/avatars/penguin.png',
    accessoryPositions: {
      ...defaultPositions,
      glasses: { top: '35%', left: '50%', transform: 'translateX(-50%)' },
      sunglasses: { top: '33%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
  {
    id: 'koala',
    emoji: '🐨',
    name: 'Koala',
    image: '/avatars/koala.png',
    accessoryPositions: {
      ...defaultPositions,
      headphones: { top: '18%', left: '50%', transform: 'translateX(-50%)' },
    },
  },
] as const

export const ACCESSORIES = [
  { id: 'none', emoji: '', name: 'None', image: null },
  { id: 'glasses', emoji: '👓', name: 'Glasses', image: '/accessories/glasses.png' },
  { id: 'sunglasses', emoji: '🕶️', name: 'Sunglasses', image: '/accessories/sunglasses.png' },
  { id: 'tophat', emoji: '🎩', name: 'Top Hat', image: '/accessories/tophat.png' },
  { id: 'cap', emoji: '🧢', name: 'Cap', image: '/accessories/cap.png' },
  { id: 'crown', emoji: '👑', name: 'Crown', image: '/accessories/crown.png' },
  { id: 'bow', emoji: '🎀', name: 'Bow', image: '/accessories/bow.png' },
  { id: 'headphones', emoji: '🎧', name: 'Headphones', image: '/accessories/headphones.png' },
] as const

export type AvatarId = (typeof AVATARS)[number]['id']
export type AccessoryId = (typeof ACCESSORIES)[number]['id']

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
