'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type AuthLevel = 'none' | 'staff' | 'admin'

type AuthState = {
  staffAuthed: boolean
  adminAuthed: boolean
  authenticateStaff: (pin: string) => Promise<boolean>
  authenticateAdmin: (pin: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  staffAuthed: false,
  adminAuthed: false,
  authenticateStaff: async () => false,
  authenticateAdmin: async () => false,
  logout: () => {},
})

const STORAGE_KEY = 'rodem-auth-level'
const STORAGE_TS = 'rodem-auth-ts'
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000 // 4시간

function getStoredAuth(): AuthLevel {
  if (typeof window === 'undefined') return 'none'
  const level = sessionStorage.getItem(STORAGE_KEY)
  const ts = sessionStorage.getItem(STORAGE_TS)
  if (!level || !ts) return 'none'
  if (Date.now() - Number(ts) > SESSION_TIMEOUT) {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_TS)
    return 'none'
  }
  return level as AuthLevel
}

function setStoredAuth(level: AuthLevel) {
  if (typeof window === 'undefined') return
  if (level === 'none') {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_TS)
  } else {
    sessionStorage.setItem(STORAGE_KEY, level)
    sessionStorage.setItem(STORAGE_TS, String(Date.now()))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<AuthLevel>('none')

  useEffect(() => {
    setLevel(getStoredAuth())
  }, [])

  const authenticateStaff = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, type: 'staff' }),
      })
      if (res.ok) {
        const newLevel = level === 'admin' ? 'admin' : 'staff' as AuthLevel
        setLevel(newLevel)
        setStoredAuth(newLevel)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [level])

  const authenticateAdmin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, type: 'admin' }),
      })
      if (res.ok) {
        setLevel('admin')
        setStoredAuth('admin')
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setLevel('none')
    setStoredAuth('none')
  }, [])

  return (
    <AuthContext.Provider value={{
      staffAuthed: level === 'staff' || level === 'admin',
      adminAuthed: level === 'admin',
      authenticateStaff,
      authenticateAdmin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
