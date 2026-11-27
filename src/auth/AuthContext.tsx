import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../api.ts'
import type { User } from '../../types.ts'
import { readToken } from './jwt.ts'

export interface AuthFetchOptions {
  method?: string
  body?: unknown
}

// Shape of `authFetch`, exported so services can type an injected parameter without
// importing the whole AuthContext (keeps the service layer free of React context).
export type AuthedFetch = <T>(path: string, options?: AuthFetchOptions) => Promise<T>

interface AuthValue {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  authFetch: AuthedFetch
}


const AuthContext = createContext<AuthValue | null>(null)
const TOKEN_KEY = 'token'

function storedToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  return token && readToken(token) ? token : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(storedToken)
  const claims = token ? readToken(token) : null
  const user: User | null = claims ? { username: claims.sub, role: claims.role } : null
  const isAuthenticated = user !== null;

  function saveToken(value: string | null) {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
    setToken(value)
  }

  async function login(username: string, password: string) {
    const res = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })

    const claims = readToken(res.accessToken)
    if(!claims){
      throw new Error('Invalid authentication token')
    }
    saveToken(res.accessToken)
  }

  async function register(username: string, email: string, password: string) {
    await api('/api/auth/register', { method: 'POST', body: { username, email, password } })
    await login(username, password)
  }

  function logout() {
    saveToken(null)
  }

  // For protected endpoints: adds the token, and logs out if the backend rejects it.
  async function authFetch<T>(path: string, options?: AuthFetchOptions) {
    try {
      return await api<T>(path, { ...options, token })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout()
      throw err
    }
  }

  // Log out automatically when the token expires.
  const expiresAt = claims?.exp
  useEffect(() => {
    if (!expiresAt) return
    const id = setTimeout(() => saveToken(null), expiresAt * 1000 - Date.now())
    return () => clearTimeout(id)
  }, [expiresAt])

  const value : AuthValue = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    authFetch,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
