import { useEffect, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import type { Sighting } from '../../types.ts'
import { getSightings } from '../../services/sightnings.ts'
import { useAuth } from '../../auth/AuthContext.tsx'
import '../../styles/UserHome.css'
import '../../styles/Sightings.css'

type ListState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'loaded'; items: Sighting[] }

interface LocationOptions {
    ciudades: string[]
    regiones: string[]
}

function formatDate(iso?: string | null) {
    if (!iso) return null
    const value = new Date(iso)
    if (Number.isNaN(value.getTime())) return null
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(value)
}

function formatLocation(sighting: Sighting) {
    const parts = [sighting.lugar, sighting.ciudad, sighting.region].filter(
        (part): part is string => Boolean(part && part.trim())
    )
    return parts.length > 0 ? parts.join(', ') : null
}

function uniqueSorted(values: Array<string | null>): string[] {
    return Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim()))))
        .sort((a, b) => a.localeCompare(b, 'es'))
}

export default function SightingsPage() {
    const [state, setState] = useState<ListState>({ status: 'loading' })
    const [attempt, setAttempt] = useState(0);
    const { user } = useAuth();

    // HU-014 (SCRUM-63/64): el backend hace match exacto por ciudad/región, así que las
    // opciones del selector salen de la primera carga sin filtrar (y no se recalculan
    // después, para que ambos selects sigan mostrando todas las ubicaciones conocidas).
    const [locationOptions, setLocationOptions] = useState<LocationOptions | null>(null)
    const [ciudad, setCiudad] = useState('')
    const [region, setRegion] = useState('')

    useEffect(() => {
        let cancelled = false
        setState({ status: 'loading' })
        getSightings({ ciudad: ciudad || undefined, region: region || undefined })
            .then(items => {
                if (cancelled) return
                setState({ status: 'loaded', items })
                setLocationOptions(prev => prev ?? {
                    ciudades: uniqueSorted(items.map(i => i.ciudad)),
                    regiones: uniqueSorted(items.map(i => i.region)),
                })
            })
            .catch((err: Error) => { if (!cancelled) setState({ status: 'error', message: err.message }) })
        return () => { cancelled = true }
    }, [attempt, ciudad, region])

    const hasActiveFilter = Boolean(ciudad || region)

    return (
        <>
            <div className="user-home">
                {/* HU-036 (SCRUM-58/59): un visitante sin sesión que llega aquí directamente
                    necesita una forma de navegar a login/registro; antes no existía ninguna. */}


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

                            {user?.role === 'ADMIN' && (
                                <Link
                                    to="/admin/characteristics"
                                    className="uh-secondary-action"
                                >
                                    Administrar características
                                </Link>
                            )}

                            {user && (
                                <Link to="/sightings/new" className="uh-secondary-action">
                                    Publicar un avistamiento
                                </Link>
                            )}


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

                        <div className="uh-filters" role="group" aria-label="Filtrar por ubicación">
                            <label className="uh-filter">
                                <span>Ciudad</span>
                                <select value={ciudad} onChange={e => setCiudad(e.target.value)}>
                                    <option value="">Todas</option>
                                    {locationOptions?.ciudades.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="uh-filter">
                                <span>Región</span>
                                <select value={region} onChange={e => setRegion(e.target.value)}>
                                    <option value="">Todas</option>
                                    {locationOptions?.regiones.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </label>
                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    className="uh-filter-clear"
                                    onClick={() => { setCiudad(''); setRegion('') }}
                                >
                                    Limpiar filtro
                                </button>
                            )}
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
                            <p className="uh-sightings-status">
                                {hasActiveFilter
                                    ? 'No hay avistamientos para esa ubicación.'
                                    : 'Aún no hay avistamientos públicos.'}
                            </p>
                        )}

                        {state.status === 'loaded' && state.items.length > 0 && (
                            <div className="uh-sighting-grid">
                                {state.items.map(sighting => {
                                    const date = formatDate(sighting.fechaHora)
                                    const location = formatLocation(sighting)
                                    return (
                                        <Link className="uh-sighting-card" to={`/sightings/${sighting.id}`} key={sighting.id}>
                                            <div className="uh-sighting-media">
                                                {sighting.fotoUrl ? (
                                                    <img src={sighting.fotoUrl} alt="" />
                                                ) : (
                                                    <span>SIN IMAGEN</span>
                                                )}
                                            </div>
                                            <div className="uh-sighting-body">
                                                <strong>{sighting.title ?? 'Avistamiento sin título'}</strong>
                                                <div className="uh-sighting-meta">
                                                    <span><MapPin size={13} aria-hidden="true"/> {location ?? 'Ubicación no disponible'}</span>
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
