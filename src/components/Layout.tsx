import { Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext.tsx'
import NavBar from './NavBar.tsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong className="app-brand">OVNIS</strong>
        <NavBar />
        <div className="account">
          <span className="account-name">{user?.username}</span>
          <span className="role">{user?.role}</span>
          <button className="secondary logout-button" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className={isHome ? 'app-main app-main--full' : 'app-main'}>
        <Outlet />
      </main>
    </div>
  )
}
