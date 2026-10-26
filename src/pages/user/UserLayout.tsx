import {Outlet, Link} from 'react-router'
import NavBar from "../../components/NavBar.tsx";
import { LogOut, Search } from 'lucide-react'
import {useAuth} from "../../auth/AuthContext.tsx";
export default function UserLayout() {
    const { logout } = useAuth()

    return(
        <div className="user-layout">
            <header className="uh-header">
                <Link className="uh-brand" to="/user" aria-label="OVNIS, inicio">
                    <span className="uh-logo" aria-hidden="true"><span /></span>
                    <span className="uh-brand-name">OVNIS</span>
                </Link>
                <NavBar role = "USER"/>



                <div className="uh-header-actions">
                    <span className="uh-motto">La verdad está ahí fuera</span>
                    <span className="uh-divider" aria-hidden="true" />
                    <Link className="uh-icon-link" to="/user/profile" aria-label="Ir a tu perfil" title="Tu perfil">
                        <Search size={16} aria-hidden="true" />
                    </Link>
                    <button className="uh-submit" type="button" onClick={logout}>
                        <LogOut size={14} aria-hidden="true" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </header>

            <Outlet />
        </div>
    )
}