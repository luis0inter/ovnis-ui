import { NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext.tsx'
import NavBar from "./NavBar.tsx";

interface Props {
  links: { to: string; label: string }[]
}

export default function Layout({ links }: Props) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isUserHome = links[0]?.to === '/user' && location.pathname === '/user'

  return (
    <>
      <header className={`header${isUserHome ? ' user-home-layout-header' : ''}`}>
        <strong>Internal Access</strong>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <span>{user?.username}</span>
          <span className="role">{user?.role}</span>
          <button className="secondary" onClick={logout}>Log out</button>
        </div>
      </header>
      <main className={`main${isUserHome ? ' user-home-layout-main' : ''}`}>
          <NavBar role="USER"/>
        <Outlet />
      </main>
    </>
  )
}
