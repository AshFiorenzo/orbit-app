import { createContext, useContext, useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import type { BlinkUser } from '@blinkdotnew/sdk'

interface AuthContextType {
  user: BlinkUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (redirectUrl?: string) => void
  logout: () => void
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
    blink.auth.login(redirectUrl || window.location.href)
  }

  const logout = () => {
    blink.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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
