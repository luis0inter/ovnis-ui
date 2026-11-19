import { NavLink } from 'react-router'
import { useAuth } from '../auth/AuthContext.tsx'

export const userLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/profile', label: 'Perfil' },
  { to: '/sightings', label: 'Avistamientos' },
  { to: '/settings', label: 'Ajustes' },
]

export const adminLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/admin/users', label: 'Usuarios' },
  { to: '/admin/sightings', label: 'Avistamientos' },
  { to: '/admin/settings', label: 'Ajustes' },
]

export default function NavBar() {
  const { user } = useAuth()

  if (!user) return null

  const links = user.role === 'ADMIN' ? adminLinks : userLinks

  return (
    <nav className="uh-nav" aria-label="Navegación principal">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.label === 'Inicio'}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}