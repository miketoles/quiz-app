import { useState } from 'react'
import { AVATARS, ACCESSORIES } from '../../lib/constants'
import { Avatar } from './Avatar'

interface AvatarPickerProps {
  selectedBase: string
  selectedAccessory: string | null
  onSelect: (base: string, accessory: string | null) => void
}

export function AvatarPicker({ selectedBase, selectedAccessory, onSelect }: AvatarPickerProps) {
  const [base, setBase] = useState(selectedBase)
  const [accessory, setAccessory] = useState(selectedAccessory)

  const handleBaseSelect = (avatarId: string) => {
    setBase(avatarId)
    onSelect(avatarId, accessory)
  }

  const handleAccessorySelect = (accessoryId: string) => {
    const newAccessory = accessoryId === 'none' ? null : accessoryId
    setAccessory(newAccessory)
    onSelect(base, newAccessory)
  }

  return (
    <div className="space-y-6">
      {/* Preview - uses Avatar component with layered images */}
      <div className="flex justify-center">
        <Avatar base={base} accessory={accessory} size="xl" />
      </div>

      {/* Avatar Selection */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3 text-center">
          Choose Your Avatar
        </label>
        <div className="grid grid-cols-5 gap-2">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => handleBaseSelect(avatar.id)}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-2xl
                transition-all
                ${base === avatar.id
                  ? 'bg-primary ring-2 ring-white scale-110'
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Accessory Selection */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3 text-center">
          Add an Accessory (optional)
        </label>
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => handleAccessorySelect(acc.id)}
              className={`
                w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl
                transition-all
                ${(accessory === acc.id || (accessory === null && acc.id === 'none'))
                  ? 'bg-primary ring-2 ring-white'
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
            >
              {acc.id === 'none' ? '✕' : acc.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
