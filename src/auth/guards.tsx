import { Navigate, Outlet } from 'react-router'
import type { Role } from '../../types.ts'
import { useAuth } from './AuthContext.tsx'

export function homeFor(_role: Role) {
  return '/'
}

export function RequireAuth() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

export function PublicOnly() {
  const { user } = useAuth()

  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export function Redirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/' : '/login'} replace />
}

export function RequireAdmin() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <Outlet />
}
