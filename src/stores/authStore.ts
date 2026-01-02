import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile, UserSettings } from '../lib/database.types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  settings: UserSettings | null
  loading: boolean
  initialized: boolean

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: 'bcba' | 'rbt') => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  updateSettings: (updates: Partial<UserSettings>) => Promise<{ error: Error | null }>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  settings: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        set({ user: session.user, session })
        await get().fetchProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user ?? null, session })

        if (session?.user) {
          await get().fetchProfile()
        } else {
          set({ profile: null, settings: null })
        }
      })
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  signUp: async (email, password, displayName, role) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role,
          },
        },
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null, profile: null, settings: null })
    } finally {
      set({ loading: false })
    }
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Fetch settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      set({ profile, settings })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      await get().fetchProfile()
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  updateSettings: async (updates) => {
    const { user } = get()
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh settings
      await get().fetchProfile()
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}))
