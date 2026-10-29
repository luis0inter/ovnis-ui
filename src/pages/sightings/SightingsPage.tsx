import { useEffect, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import type { Sighting } from '../../types.ts'
import { getSightings } from '../../services/sightnings.ts'
import '../../styles/UserHome.css'
import '../../styles/Sightings.css'

type ListState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'loaded'; items: Sighting[] }

function formatDate(iso?: string) {
    if (!iso) return null
    const value = new Date(iso)
    if (Number.isNaN(value.getTime())) return null
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(value)
}

export default function SightingsPage() {
    const [state, setState] = useState<ListState>({ status: 'loading' })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false
        setState({ status: 'loading' })
        getSightings()
            .then(items => { if (!cancelled) setState({ status: 'loaded', items }) })
            .catch((err: Error) => { if (!cancelled) setState({ status: 'error', message: err.message }) })
        return () => { cancelled = true }
    }, [attempt])

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
                                <span className="uh-eyebrow">RED DE OBSERVACIÓN</span>
                                <h2 id="uh-discovery-title">Avistamientos reportados</h2>
                                <p>Reportes públicos compartidos por la comunidad.</p>
                            </div>
                            <span className="uh-section-coordinate">OBSERVA · DOCUMENTA · COMPARTE</span>
                        </div>

                        {state.status === 'loading' && (
                            <p className="uh-sightings-status" role="status">Cargando avistamientos…</p>
                        )}

                        {state.status === 'error' && (
                            <div className="uh-sightings-status uh-sightings-status-error" role="alert">
                                <p>{state.message}</p>
                                <button type="button" className="uh-secondary-action" onClick={() => setAttempt(n => n + 1)}>
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {state.status === 'loaded' && state.items.length === 0 && (
                            <p className="uh-sightings-status">Aún no hay avistamientos públicos.</p>
                        )}

                        {state.status === 'loaded' && state.items.length > 0 && (
                            <div className="uh-sighting-grid">
                                {state.items.map(sighting => {
                                    const date = formatDate(sighting.date)
                                    return (
                                        <Link className="uh-sighting-card" to={`/sightings/${sighting.id}`} key={sighting.id}>
                                            <div className="uh-sighting-media">
                                                {sighting.photoURL ? (
                                                    <img src={sighting.photoURL} alt="" />
                                                ) : (
                                                    <span>SIN IMAGEN</span>
                                                )}
                                            </div>
                                            <div className="uh-sighting-body">
                                                <strong>{sighting.title ?? 'Avistamiento sin título'}</strong>
                                                <div className="uh-sighting-meta">
                                                    <span><MapPin size={13} aria-hidden="true"/> {sighting.location ?? 'Ubicación no disponible'}</span>
                                                    {date && <span><Calendar size={13} aria-hidden="true"/> {date}</span>}
                                                </div>
                                                {sighting.description && <p>{sighting.description}</p>}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
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
