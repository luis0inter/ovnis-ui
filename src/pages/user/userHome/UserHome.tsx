import { ArrowRight, CirclePlay, Plus, Search } from 'lucide-react'
import { Link} from 'react-router'
import { useAuth } from '../../../auth/AuthContext.tsx'
import './UserHome.css'


export default function UserHome() {
  const { user} = useAuth()
  return (
    <div className="user-home">


      <main>
        <section className="uh-hero" aria-labelledby="uh-title">
          <div className="uh-sky" aria-hidden="true">
            <div className="uh-orbit uh-orbit-one" />
            <div className="uh-orbit uh-orbit-two" />
            <div className="uh-ufo"><span /></div>
            <div className="uh-planet" />
          </div>

          <div className="uh-telemetry uh-telemetry-left">
            <span className="uh-live-dot" />
            CIELOS REALES. PREGUNTAS SIN RESPUESTA.
          </div>
          <div className="uh-telemetry uh-telemetry-right">
            <span>RED DE OBSERVACIÓN</span>
            <span>ACTIVA · GLOBAL</span>
          </div>

          <div className="uh-hero-content">
            <span className="uh-case-tag">ARCHIVO ABIERTO <span>•</span> OBSERVADOR {user?.username?.toUpperCase()}</span>
            <h1 id="uh-title">Explora lo<br /><em>inexplicable</em></h1>
            <p className="uh-hero-copy">
              Un archivo para quienes miran hacia arriba. Observa, documenta y comparte
              lo que todavía no podemos explicar.
            </p>
            <div className="uh-hero-actions">
              <Link className="uh-primary-action" to="/user#archivo">
                Explorar el archivo <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="uh-secondary-action" to="/user/profile">
                <CirclePlay size={18} aria-hidden="true" />
                Mi perfil
              </Link>
            </div>
          </div>

          <div className="uh-bottom-label" aria-hidden="true">SEÑAL DETECTADA · SIGUE OBSERVANDO</div>
          <div className="uh-stats" id="archivo">
            <div className="uh-stat">
              <span className="uh-stat-value">Observa</span>
              <span className="uh-stat-label">MIRA MÁS ALLÁ</span>
              <span className="uh-stat-line" />
            </div>
            <div className="uh-stat">
              <span className="uh-stat-value">Documenta</span>
              <span className="uh-stat-label">CADA DETALLE CUENTA</span>
              <span className="uh-stat-line" />
            </div>
            <div className="uh-stat">
              <span className="uh-stat-value">Comparte</span>
              <span className="uh-stat-label">AMPLÍA EL HORIZONTE</span>
              <span className="uh-stat-line" />
            </div>
            <p className="uh-quote">
              “En algún lugar, algo increíble espera ser conocido.”
              <span>— CARL SAGAN</span>
            </p>
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
              <span className="uh-card-icon"><Search size={18} aria-hidden="true" /></span>
              <span className="uh-card-content">
                <span className="uh-card-label">01 / OBSERVADOR</span>
                <strong>Tu perfil</strong>
                <span>Consulta y actualiza tu información personal.</span>
              </span>
              <ArrowRight className="uh-card-arrow" size={18} aria-hidden="true" />
            </Link>
            <Link className="uh-card" to="/user/settings">
              <span className="uh-card-icon"><Plus size={18} aria-hidden="true" /></span>
              <span className="uh-card-content">
                <span className="uh-card-label">02 / PREFERENCIAS</span>
                <strong>Ajustes de cuenta</strong>
                <span>Administra tus preferencias y acceso.</span>
              </span>
              <ArrowRight className="uh-card-arrow" size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="uh-footer">
        <span>© {new Date().getFullYear()} OVNIS — Registro de fenómenos aéreos</span>
        <span>ARCHIVO DE OBSERVACIÓN <i>///</i> CIELOS SIN FRONTERAS</span>
      </footer>
    </div>
  )
}
