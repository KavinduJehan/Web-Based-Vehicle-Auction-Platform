import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { me as fetchMe, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

const INACTIVITY_MS = 30 * 60 * 1000 // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)   // true while restoring session
  const timerRef = useRef(null)

  // Restore session on mount by calling /auth/me (reads the HttpOnly cookie)
  useEffect(() => {
    fetchMe()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    apiLogout().catch(() => {})
    setUser(null)
  }

  // Reset the inactivity timer on any user activity
  function resetTimer() {
    clearTimeout(timerRef.current)
    if (!user) return
    timerRef.current = setTimeout(() => {
      logout()
      window.dispatchEvent(new CustomEvent('session-expired'))
    }, INACTIVITY_MS)
  }

  useEffect(() => {
    if (!user) {
      clearTimeout(timerRef.current)
      return
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [user])

  function login(userData) {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin:    user?.role === 'admin',
      isVerified: user?.isVerified === true,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
