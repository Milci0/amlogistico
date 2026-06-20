import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // czy trwa początkowa hydratacja sesji

  // Na starcie aplikacji próbujemy odtworzyć sesję z httpOnly cookie
  useEffect(() => {
    let active = true
    api.get('/auth/me')
      .then((d) => { if (active) setUser(d.user) })
      .catch(() => { if (active) setUser(null) }) // 401 = brak sesji, to normalne
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (email, password) => {
    const d = await api.post('/auth/login', { email, password })
    setUser(d.user)
    return d.user
  }, [])

  const register = useCallback(async (payload) => {
    const d = await api.post('/auth/register', payload)
    setUser(d.user)
    return d.user
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch { /* i tak czyścimy lokalnie */ }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth musi być użyte wewnątrz <AuthProvider>')
  return ctx
}
