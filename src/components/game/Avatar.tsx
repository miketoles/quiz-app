import { useState } from 'react'
import { AVATARS, ACCESSORIES, type AccessoryId } from '../../lib/constants'

interface AvatarProps {
  base: string
  accessory?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showAccessory?: boolean
}

export function Avatar({ base, accessory, size = 'md', showAccessory = true }: AvatarProps) {
  const [avatarImageError, setAvatarImageError] = useState(false)
  const [accessoryImageError, setAccessoryImageError] = useState(false)

  const avatar = AVATARS.find((a) => a.id === base) || AVATARS[0]
  const acc = accessory && accessory !== 'none'
    ? ACCESSORIES.find((a) => a.id === accessory)
    : null

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const emojiFontSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  }

  // Accessory sizing relative to avatar (as percentage of avatar size)
  const accessorySizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }

  const accessoryEmojiFontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  }

  // Get accessory position for this avatar
  const getAccessoryStyle = () => {
    if (!acc || acc.id === 'none') return {}
    const positions = avatar.accessoryPositions[acc.id as Exclude<AccessoryId, 'none'>]
    return positions || {}
  }

  const shouldUseAvatarImage = avatar.image && !avatarImageError
  const shouldUseAccessoryImage = acc?.image && !accessoryImageError

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-white/10 rounded-full flex items-center justify-center overflow-visible`}
    >
      {/* Avatar base */}
      {shouldUseAvatarImage ? (
        <img
          src={avatar.image}
          alt={avatar.name}
          className="w-full h-full object-contain rounded-full"
          onError={() => setAvatarImageError(true)}
        />
      ) : (
        <span className={emojiFontSizes[size]}>{avatar.emoji}</span>
      )}

      {/* Accessory overlay */}
      {showAccessory && acc && acc.id !== 'none' && (
        <>
          {shouldUseAccessoryImage ? (
            <img
              src={acc.image}
              alt={acc.name}
              className={`absolute ${accessorySizes[size]} object-contain pointer-events-none`}
              style={getAccessoryStyle()}
              onError={() => setAccessoryImageError(true)}
            />
          ) : (
            // Fallback: emoji positioned based on accessory type
            <span
              className={`absolute ${accessoryEmojiFontSizes[size]} pointer-events-none`}
              style={getAccessoryStyle()}
            >
              {acc.emoji}
            </span>
          )}
        </>
      )}
    </div>
  )
}
