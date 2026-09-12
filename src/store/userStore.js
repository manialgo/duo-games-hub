import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useUserStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null, // Holds username, current_streak, highest_streak
  loading: true,

  // Initialize session and listen for auth changes
  initAuth: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) get().fetchProfile(session.user.id)
      else set({ loading: false })
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) get().fetchProfile(session.user.id)
      else set({ profile: null, loading: false })
    })
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      set({ profile: data, loading: false })
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  }
}))

export default useUserStore
