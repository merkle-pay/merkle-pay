import Cookies from 'js-cookie'
import { create } from 'zustand'

const SESSION_TOKEN = 'sessionToken'
const JWT_TOKEN = 'jwtToken'

export interface AuthUser {
  id: string
  name: string
  email: string
  blockchains: string[]
  wallets: string[]
  image: string | null
  exp: number
  level: number
  business_name: string
  backup_email: string
  role?: string[] // Optional if you add roles later
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    exp: number
    setExp: (exp: number) => void
    jwtToken: string
    setJwtToken: (jwtToken: string) => void
    sessionToken: string
    setSessionToken: (sessionToken: string) => void
    signout: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieStateSession = Cookies.get(SESSION_TOKEN)
  const initTokenSession = cookieStateSession
    ? JSON.parse(cookieStateSession)
    : ''
  const cookieStateJwt = Cookies.get(JWT_TOKEN)
  const initTokenJwt = cookieStateJwt ? JSON.parse(cookieStateJwt) : ''

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),

      exp: 0,
      setExp: (exp) =>
        set((state) => ({ ...state, auth: { ...state.auth, exp } })),

      jwtToken: initTokenJwt || '',
      setJwtToken: (jwtToken) =>
        set((state) => {
          Cookies.set(JWT_TOKEN, JSON.stringify(jwtToken))
          return { ...state, auth: { ...state.auth, jwtToken } }
        }),

      sessionToken: initTokenSession || '',
      setSessionToken: (sessionToken) =>
        set((state) => {
          Cookies.set(SESSION_TOKEN, JSON.stringify(sessionToken))
          return { ...state, auth: { ...state.auth, sessionToken } }
        }),

      signout: () =>
        set((state) => {
          Cookies.remove(SESSION_TOKEN)
          Cookies.remove(JWT_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, sessionToken: '', jwtToken: '' },
          }
        }),
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
