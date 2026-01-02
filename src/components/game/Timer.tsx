import { useEffect, useState } from 'react'

interface TimerProps {
  duration: number // seconds
  onComplete?: () => void
  isPaused?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Timer({ duration, onComplete, isPaused = false, size = 'lg' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, duration - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [duration, startTime, isPaused, onComplete, timeLeft])

  const percentage = (timeLeft / duration) * 100
  const isUrgent = timeLeft <= 5

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-5xl',
  }

  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8
  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56
  const circumference = 2 * Math.PI * radius

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={isUrgent ? '#FF3355' : '#66BF39'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percentage / 100)}
          strokeLinecap="round"
          className={`transition-all duration-100 ${isUrgent ? 'animate-pulse' : ''}`}
        />
      </svg>
      {/* Time display */}
      <span
        className={`font-bold ${isUrgent ? 'text-error animate-pulse' : 'text-white'}`}
      >
        {timeLeft}
      </span>
    </div>
  )
}
