import {NavLink } from 'react-router'
import {userLinks, adminLinks} from './../App.tsx'
type  NavBarProps = {
    role : "USER"| "ADMIN"
}
export default function NavBar({role}:NavBarProps) {

    const links = role === "ADMIN" ? adminLinks : userLinks;


    return(
        <div>
            <nav className="uh-nav" aria-label="Navegación principal">
                {links.map((link) => (<NavLink
                    key = {link.to}
                    to={link.to}
                    end = {link.label == "Inicio"}
                    >
                    {link.label}
                    </NavLink>))}
            </nav>


        </div>
    )
}