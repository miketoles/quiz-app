interface AnswerButtonProps {
  color: 'red' | 'blue' | 'yellow' | 'green'
  text: string
  isCorrect?: boolean
  showResult?: boolean
  responseCount?: number
  totalResponses?: number
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const colorConfig = {
  red: {
    bg: 'bg-answer-red',
    icon: '\u25B2', // Triangle
    label: 'A',
  },
  blue: {
    bg: 'bg-answer-blue',
    icon: '\u25C6', // Diamond
    label: 'B',
  },
  yellow: {
    bg: 'bg-answer-yellow',
    icon: '\u25CF', // Circle
    label: 'C',
  },
  green: {
    bg: 'bg-answer-green',
    icon: '\u25A0', // Square
    label: 'D',
  },
}

export function AnswerButton({
  color,
  text,
  isCorrect = false,
  showResult = false,
  responseCount = 0,
  totalResponses = 0,
  onClick,
  disabled = false,
  size = 'lg',
}: AnswerButtonProps) {
  const config = colorConfig[color]
  const percentage = totalResponses > 0 ? Math.round((responseCount / totalResponses) * 100) : 0

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg md:text-xl',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${config.bg}
        ${sizeClasses[size]}
        rounded-xl
        text-white font-bold
        flex items-center gap-3
        transition-all
        ${!disabled && !showResult ? 'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' : ''}
        ${disabled ? 'cursor-default' : 'cursor-pointer'}
        ${showResult && isCorrect ? 'ring-4 ring-white shadow-xl' : ''}
        ${showResult && !isCorrect ? 'opacity-50' : ''}
        relative overflow-hidden
        w-full
      `}
    >
      {/* Background bar for results */}
      {showResult && (
        <div
          className="absolute inset-0 bg-black/20 origin-left transition-all duration-500"
          style={{ transform: `scaleX(${percentage / 100})` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3 w-full">
        <span className="text-2xl md:text-3xl">{config.icon}</span>
        <span className="flex-1 text-left">{text}</span>
        {showResult && (
          <div className="text-right">
            {isCorrect && <span className="text-2xl mr-2">&#10003;</span>}
            <span className="text-lg font-normal">{responseCount}</span>
            <span className="text-sm text-white/60 ml-1">({percentage}%)</span>
          </div>
        )}
      </div>
    </button>
  )
}
