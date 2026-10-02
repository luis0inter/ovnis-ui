import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext.tsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(username, email, password)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="lg lg-ufo">
      <div className="lg-bg" aria-hidden="true">
        <div className="lg-grid" />
        <div className="lg-ring lg-ring-1" />
        <div className="lg-ring lg-ring-2" />
        <div className="lg-ring lg-ring-3" />
        <div className="lg-shade" />
      </div>

      <header className="lg-header">
        <Link className="lg-brand" to="/" aria-label="OVNIS, inicio">
          <span className="lg-logo" aria-hidden="true">
            <span className="lg-logo-dot" />
            <span className="lg-logo-orbit" />
          </span>
          <span>
            <span className="lg-brand-name">OVNIS</span>
            <span className="lg-brand-sub">Archivo de avistamientos</span>
          </span>
        </Link>
        <div className="lg-telemetry" aria-label="Estado del sistema">
          <span className="lg-tele-item"><span className="lg-ping" /> SISTEMA ACTIVO</span>
          <span className="sep">/</span>
          <span>RED DE OBSERVACIÓN</span>
        </div>
        <Link className="lg-back" to="/">Volver al inicio</Link>
      </header>

      <main className="lg-main">
        <div className="lg-wrap">
          <section className="lg-card" aria-labelledby="register-title">
            <span className="lg-corner tl" aria-hidden="true" />
            <span className="lg-corner tr" aria-hidden="true" />
            <span className="lg-corner bl" aria-hidden="true" />
            <span className="lg-corner br" aria-hidden="true" />

            <div className="lg-top">
              <div className="lg-top-left">
                <span className="lg-badge">NUEVO INVESTIGADOR</span>
                <span className="lg-code">REF. <strong>OV-02</strong></span>
              </div>
              <div className="lg-status">
                <small>REGISTRO</small>
                <span><span className="lg-dot" /> ABIERTO</span>
              </div>
            </div>

            <p className="lg-eyebrow">Únete a la red de observación</p>
            <h1 className="lg-title" id="register-title">Crea tu cuenta</h1>
            <p className="lg-lead">Registra avistamientos y consulta los reportes de la comunidad.</p>

            <form className="lg-form" onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-label" htmlFor="register-username">Nombre de usuario</label>
                <input
                  className="lg-input"
                  id="register-username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={50}
                  required
                  autoFocus
                />
              </div>

              <div className="lg-field">
                <label className="lg-label" htmlFor="register-email">Correo electrónico</label>
                <input
                  className="lg-input"
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  required
                />
              </div>

              <div className="lg-field">
                <label className="lg-label" htmlFor="register-password">Contraseña</label>
                <input
                  className="lg-input"
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                />
              </div>

              {error && <p className="lg-error" role="alert">{error}</p>}
              <button className="lg-submit" type="submit" disabled={loading}>
                {loading ? 'Creando expediente…' : 'Crear cuenta'}
                {!loading && <span className="arrow" aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="lg-register">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>

            <div className="lg-quote">
              <p>“Cada testimonio aporta una pieza al fenómeno.”</p>
              <span>Red de observación OVNIS</span>
            </div>
            <div className="lg-case" aria-label="Clasificación del expediente">
              <span>TIPO DE CUENTA: <span className="cred">INVESTIGADOR</span></span>
              <span>•</span>
              <span>REPORTE DE AVISTAMIENTO</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="lg-footer">
        <span>© {new Date().getFullYear()} OVNIS — Registro de fenómenos aéreos</span>
        <span className="lg-foot-tag">OBSERVA · DOCUMENTA · COMPARTE</span>
      </footer>
    </div>
  )
}
