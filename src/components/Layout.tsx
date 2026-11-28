import { Link, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext.tsx'
import NavBar from './NavBar.tsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isFullWidth =
    location.pathname === '/' ||
    location.pathname === '/admin/sightings' ||
    location.pathname.startsWith('/sightings')

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong className="app-brand">OVNIS</strong>
        <NavBar />
        <div className="account">
          {user ? (
            <>
              <span className="account-name">{user.username}</span>
              <span className="role">{user.role}</span>
              <button className="secondary logout-button" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link className="auth-link" to="/login">Iniciar sesión</Link>
              <Link className="auth-link auth-link--primary" to="/register">Registrarse</Link>
            </>
          )}
        </div>
      </header>

      <main className={isFullWidth ? 'app-main app-main--full' : 'app-main'}>
        <Outlet />
      </main>
    </div>
  )
}
