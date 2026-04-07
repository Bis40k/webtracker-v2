import { useState, useEffect } from 'react'
import { appClient } from '@/lib/app-client'
import { type AppUser } from '@/lib/app-client'

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = appClient.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  return { user, loading, isAuthenticated: !!user }
}

