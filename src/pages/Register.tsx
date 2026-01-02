import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
export function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'bcba' | 'rbt'>('rbt')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await signUp(email, password, displayName, role)

      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🎯</span>
          <h1 className="text-2xl font-bold text-white mt-4">Create Account</h1>
          <p className="text-white/60 mt-2">Join BIP Quiz to start training</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            type="text"
            label="Display Name"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('rbt')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  role === 'rbt'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                <div className="font-bold">RBT</div>
                <div className="text-xs opacity-60">Registered Behavior Technician</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('bcba')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  role === 'bcba'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                <div className="font-bold">BCBA</div>
                <div className="text-xs opacity-60">Board Certified Behavior Analyst</div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <Link to="/join" className="text-white/60 hover:text-white transition-colors">
            Or join a game with PIN →
          </Link>
        </div>
      </Card>
    </div>
  )
}
