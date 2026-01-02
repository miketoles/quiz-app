import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuestState {
  guestId: string | null
  guestName: string | null
  avatarBase: string | null
  avatarAccessory: string | null
  isSetup: boolean

  // Actions
  setGuestInfo: (name: string, avatarBase: string, avatarAccessory: string | null) => void
  clearGuest: () => void
}

// Generate a random guest ID
const generateGuestId = () => {
  return 'guest_' + Math.random().toString(36).substring(2, 15)
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      guestId: null,
      guestName: null,
      avatarBase: null,
      avatarAccessory: null,
      isSetup: false,

      setGuestInfo: (name, avatarBase, avatarAccessory) => {
        const currentId = get().guestId || generateGuestId()
        set({
          guestId: currentId,
          guestName: name,
          avatarBase,
          avatarAccessory,
          isSetup: true,
        })
      },

      clearGuest: () => {
        set({
          guestId: null,
          guestName: null,
          avatarBase: null,
          avatarAccessory: null,
          isSetup: false,
        })
      },
    }),
    {
      name: 'guest-storage',
    }
  )
)
