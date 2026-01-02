import { AVATARS, ACCESSORIES } from '../../lib/constants'

interface AvatarProps {
  base: string
  accessory?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showAccessory?: boolean
}

export function Avatar({ base, accessory, size = 'md', showAccessory = true }: AvatarProps) {
  const avatar = AVATARS.find((a) => a.id === base) || AVATARS[0]
  const acc = accessory ? ACCESSORIES.find((a) => a.id === accessory) : null

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl',
  }

  const accessorySizeClasses = {
    sm: 'text-xs -top-1 -right-1',
    md: 'text-sm -top-1 -right-1',
    lg: 'text-lg -top-2 -right-2',
    xl: 'text-2xl -top-2 -right-2',
  }

  return (
    <div className={`relative ${sizeClasses[size]} bg-white/10 rounded-full flex items-center justify-center`}>
      <span>{avatar.emoji}</span>
      {showAccessory && acc && acc.id !== 'none' && (
        <span className={`absolute ${accessorySizeClasses[size]}`}>
          {acc.emoji}
        </span>
      )}
    </div>
  )
}
