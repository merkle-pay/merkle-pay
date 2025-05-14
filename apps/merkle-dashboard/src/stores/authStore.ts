import { create } from 'zustand'

export interface AuthUser {
  username: string
  email: string
  avatar_image_url: string | null
  role: string
  businesses?: {
    id: string
    business_name: string
    blockchains: string[]
    wallets: string[]
  }[]
  backup_email?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    signout: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      signout: () =>
        set((state) => {
          return {
            ...state,
            auth: { ...state.auth, user: null },
          }
        }),
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
