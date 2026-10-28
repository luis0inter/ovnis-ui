import {ArrowRight, CirclePlay, Plus, Search} from 'lucide-react'
import {Link} from 'react-router'
import '../../styles/UserHome.css'

export default function SightingsPage() {
    return (
        <>
            <div className="user-home">
                <main>
                    <section className="uh-hero" aria-labelledby="uh-title">
                        <div className="uh-sky" aria-hidden="true">
                            <div className="uh-orbit uh-orbit-one"/>
                            <div className="uh-orbit uh-orbit-two"/>
                            <div className="uh-ufo"><span/></div>
                            <div className="uh-planet"/>
                        </div>


                        <div className="uh-hero-content">

                            <h1 id="uh-title"><br/><em>Avistamientos</em></h1>


                        </div>


                    </section>

                    <section className="uh-discovery" aria-labelledby="uh-discovery-title">
                        <div className="uh-section-heading">
                            <div>
                                <span className="uh-eyebrow">TU ESPACIO</span>
                                <h2 id="uh-discovery-title">Continúa explorando</h2>
                                <p>Tu lugar en la red de observación empieza aquí.</p>
                            </div>
                            <span className="uh-section-coordinate">OBSERVA · DOCUMENTA · COMPARTE</span>
                        </div>
                        <div className="uh-cards">
                            <Link className="uh-card" to="/user/profile">
                                <span className="uh-card-icon"><Search size={18} aria-hidden="true"/></span>
                                <span className="uh-card-content">
                <span className="uh-card-label">01 / OBSERVADOR</span>
                <strong>Tu perfil</strong>
                <span>Consulta y actualiza tu información personal.</span>
              </span>
                                <ArrowRight className="uh-card-arrow" size={18} aria-hidden="true"/>
                            </Link>

                        </div>
                    </section>
                </main>

                <footer className="uh-footer">
                    <span>© {new Date().getFullYear()} OVNIS — Registro de fenómenos aéreos</span>
                    <span>ARCHIVO DE OBSERVACIÓN <i>///</i> CIELOS SIN FRONTERAS</span>
                </footer>
            </div>


        </>
    )
}
