import { createContext, useContext, useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import type { BlinkUser } from '@blinkdotnew/sdk'

interface AuthContextType {
  user: BlinkUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (redirectUrl?: string) => void
  logout: () => void
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BlinkUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const login = (redirectUrl?: string) => {
    // In headless mode, we redirect to our own /auth page
    window.location.href = `/auth?redirect=${encodeURIComponent(redirectUrl || window.location.pathname)}`
  }

  const logout = () => {
    blink.auth.signOut()
  }

  const signInWithGoogle = async () => {
    await blink.auth.signInWithGoogle()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
