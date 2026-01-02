import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGuestStore } from '../stores/guestStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { AvatarPicker } from '../components/game/AvatarPicker'
import { Avatar } from '../components/game/Avatar'
import { config } from '../lib/config'

type Step = 'name' | 'avatar' | 'choice'

export function GuestSetup() {
  const navigate = useNavigate()
  const { setGuestInfo } = useGuestStore()
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [avatarBase, setAvatarBase] = useState('fox')
  const [avatarAccessory, setAvatarAccessory] = useState<string | null>(null)

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setStep('avatar')
    }
  }

  const handleAvatarComplete = () => {
    setGuestInfo(name.trim(), avatarBase, avatarAccessory)
    setStep('choice')
  }

  const handleChoice = (choice: 'host' | 'play') => {
    if (choice === 'host') {
      navigate('/')
    } else {
      navigate('/join')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-6xl">🎯</span>
          <h1 className="text-2xl font-bold text-white mt-4">{config.appName}</h1>
        </div>

        {/* Step 1: Name */}
        {step === 'name' && (
          <Card>
            <h2 className="text-xl font-bold text-white text-center mb-6">
              What name would you like to go by?
            </h2>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
              <Button type="submit" className="w-full" size="lg" disabled={!name.trim()}>
                Continue
              </Button>
            </form>
          </Card>
        )}

        {/* Step 2: Avatar */}
        {step === 'avatar' && (
          <Card>
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Choose your avatar
            </h2>
            <p className="text-white/60 text-center text-sm mb-6">
              Hey {name}! Pick a character and accessory
            </p>

            <div className="flex justify-center mb-6">
              <Avatar base={avatarBase} accessory={avatarAccessory} size="xl" />
            </div>

            <AvatarPicker
              selectedBase={avatarBase}
              selectedAccessory={avatarAccessory}
              onSelect={(base, accessory) => {
                setAvatarBase(base)
                setAvatarAccessory(accessory)
              }}
            />

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep('name')}>
                Back
              </Button>
              <Button className="flex-1" size="lg" onClick={handleAvatarComplete}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Choice */}
        {step === 'choice' && (
          <Card>
            <div className="flex justify-center mb-4">
              <Avatar base={avatarBase} accessory={avatarAccessory} size="lg" />
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Welcome, {name}!
            </h2>
            <p className="text-white/60 text-center text-sm mb-6">
              What would you like to do?
            </p>

            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleChoice('host')}
              >
                <span className="text-xl mr-2">📺</span>
                Host or Create a Quiz
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => handleChoice('play')}
              >
                <span className="text-xl mr-2">🎮</span>
                Join a Quiz
              </Button>
            </div>

            <button
              onClick={() => setStep('avatar')}
              className="w-full mt-4 text-white/60 hover:text-white text-sm transition-colors"
            >
              Change avatar
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}
