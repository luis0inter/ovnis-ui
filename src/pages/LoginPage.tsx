import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext.tsx'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
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
          <section className="lg-card" aria-labelledby="login-title">
            <span className="lg-corner tl" aria-hidden="true" />
            <span className="lg-corner tr" aria-hidden="true" />
            <span className="lg-corner bl" aria-hidden="true" />
            <span className="lg-corner br" aria-hidden="true" />

            <div className="lg-top">
              <div className="lg-top-left">
                <span className="lg-badge">ACCESO RESTRINGIDO</span>
                <span className="lg-code">REF. <strong>OV-01</strong></span>
              </div>
              <div className="lg-status">
                <small>CANAL SEGURO</small>
                <span><span className="lg-dot" /> EN LÍNEA</span>
              </div>
            </div>

            <p className="lg-eyebrow">Expedientes bajo observación</p>
            <h1 className="lg-title" id="login-title">Inicia sesión</h1>
            <p className="lg-lead">Accede a los reportes y comparte tus propios avistamientos.</p>

            <form className="lg-form" onSubmit={handleSubmit}>
              <label className="lg-label" htmlFor="username">Nombre de usuario</label>
              <input
                className="lg-input"
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />

              <label className="lg-label" htmlFor="password">Contraseña</label>
              <input
                className="lg-input"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="lg-error" role="alert">{error}</p>}
              <button className="lg-submit" type="submit" disabled={loading}>
                {loading ? 'Verificando credenciales…' : 'Entrar al archivo'}
                {!loading && <span className="arrow" aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="lg-register">
              ¿Aún no tienes una cuenta? <Link to="/register">Solicita acceso</Link>
            </p>

            <div className="lg-quote">
              <p>“La verdad está ahí fuera. El registro comienza contigo.”</p>
              <span>Red de observación OVNIS</span>
            </div>
            <div className="lg-case" aria-label="Clasificación del expediente">
              <span>CLASIFICACIÓN: <span className="cred">PÚBLICA</span></span>
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
