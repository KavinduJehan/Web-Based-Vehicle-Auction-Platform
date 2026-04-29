import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext(null)

const INACTIVITY_MS = 30 * 60 * 1000 // 30 minutes

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token')
    return t ? decodeToken(t) : null
  })
  const timerRef = useRef(null)

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Reset the inactivity timer on any user activity
  function resetTimer() {
    clearTimeout(timerRef.current)
    if (!localStorage.getItem('token')) return
    timerRef.current = setTimeout(() => {
      logout()
      // Signal other tabs / components
      window.dispatchEvent(new CustomEvent('session-expired'))
    }, INACTIVITY_MS)
  }

  useEffect(() => {
    if (!token) {
      clearTimeout(timerRef.current)
      return
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer() // start the initial timer

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [token])

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(decodeToken(newToken))
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
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
