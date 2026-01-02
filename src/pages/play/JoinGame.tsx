import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGameStore } from '../../stores/gameStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { AvatarPicker } from '../../components/game/AvatarPicker'
import { AVATARS } from '../../lib/constants'

type Step = 'pin' | 'avatar'

export function JoinGame() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPin = searchParams.get('pin') || ''

  const { joinGame } = useGameStore()

  const [step, setStep] = useState<Step>(initialPin ? 'avatar' : 'pin')
  const [gamePin, setGamePin] = useState(initialPin)
  const [nickname, setNickname] = useState('')
  const [avatarBase, setAvatarBase] = useState<string>(AVATARS[0].id)
  const [avatarAccessory, setAvatarAccessory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // If PIN is provided in URL, go directly to avatar step
    if (initialPin) {
      setStep('avatar')
    }
  }, [initialPin])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (gamePin.length !== 6 || !/^\d+$/.test(gamePin)) {
      setError('Please enter a valid 6-digit game PIN')
      return
    }

    setStep('avatar')
  }

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    if (nickname.length < 1 || nickname.length > 20) {
      setError('Nickname must be 1-20 characters')
      return
    }

    setLoading(true)

    const { error: joinError } = await joinGame(
      gamePin,
      nickname.trim(),
      avatarBase,
      avatarAccessory
    )

    if (joinError) {
      setError(joinError.message)
      setLoading(false)
      return
    }

    navigate(`/play/lobby?pin=${gamePin}`)
  }

  const handleAvatarSelect = (base: string, accessory: string | null) => {
    setAvatarBase(base)
    setAvatarAccessory(accessory)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">BIP Quiz</h1>
          <p className="text-white/60 mt-2">Join a game to play!</p>
        </div>

        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {step === 'pin' ? (
          <Card>
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Enter Game PIN</h2>
                <p className="text-white/60 text-sm">
                  Look at the host screen for the PIN
                </p>
              </div>

              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit PIN"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />

              <Button type="submit" size="lg" className="w-full">
                Next
              </Button>
            </form>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleJoinGame} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Create Your Player</h2>
                <p className="text-white/60 text-sm">
                  Game PIN: <span className="font-bold text-white">{gamePin}</span>
                  <button
                    type="button"
                    onClick={() => setStep('pin')}
                    className="text-primary ml-2 underline"
                  >
                    Change
                  </button>
                </p>
              </div>

              <Input
                label="Nickname"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />

              <AvatarPicker
                selectedBase={avatarBase}
                selectedAccessory={avatarAccessory}
                onSelect={handleAvatarSelect}
              />

              <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                Join Game
              </Button>
            </form>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Scan the QR code on the host screen to join faster
        </p>
      </div>
    </div>
  )
}
