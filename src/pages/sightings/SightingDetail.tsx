import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Calendar, MapPin } from 'lucide-react'
import type {Sighting} from  '../../types.ts'
import {getSightingById} from "../../services/sightnings.ts";
import "../../styles/SightingDetail.css"

type State =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'notFound' }
    | { status: 'loaded'; avistamiento: Sighting}

const LIST_ROUTE = '/sightings'
function formatDate(iso: string) {
    const d = new Date(iso)
    const date = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    return `${date} // ${hora}`
}

function formatLocation(a: { lugar: string | null; ciudad: string | null; region: string | null }) {
    const parts = [a.lugar, a.ciudad, a.region].filter((part): part is string => Boolean(part && part.trim()))
    return parts.length > 0 ? parts.join(', ') : null
}

export default function SightingDetail() {
    const { id } = useParams()
    const [state, setState] = useState<State>({ status: 'loading' })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        if (!id) return
        let cancelled = false
        setState({ status: 'loading' })
        getSightingById(id)
            .then(a => { if (!cancelled) setState(a ? { status: 'loaded', avistamiento: a } : { status: 'notFound' }) })
            .catch((err: Error) => { if (!cancelled) setState({ status: 'error', message: err.message }) })
        return () => { cancelled = true }
    }, [id, attempt])

    return (
        <section className="dossier">
            <div className="dossier-top">
                <Link to={LIST_ROUTE} className="dossier-back">← BACK TO SIGHTINGS</Link>
                <span className="dossier-tag">CLASSIFIED INVESTIGATIVE DOSSIER // DECLASSIFIED ARCHIVE</span>
            </div>

            {state.status === 'loading' && <p className="dossier-status">RETRIEVING CASE FILE…</p>}

            {state.status === 'notFound' && (
                <p className="dossier-status">CASE FILE NOT FOUND OR NO LONGER AVAILABLE.</p>
            )}

            {state.status === 'error' && (
                <div className="dossier-status">
                    <p>{state.message}</p>
                    <button className="dossier-btn" onClick={() => setAttempt(n => n + 1)}>Retry →</button>
                </div>
            )}

            {state.status === 'loaded' && (() => {
                const a = state.avistamiento
                return (
                    <div className="dossier-grid">
                        {/* Left: case narrative */}
                        <div className="dossier-info">
                            <div>
                                <span className="dossier-case">CASE #{a.id}</span>
                                <h1 className="dossier-title">{a.title ?? 'Untitled Sighting'}</h1>
                            </div>
                            <div className="dossier-meta">
                                <div><MapPin size={14} /><span>{formatLocation(a) ?? 'Location unknown'}</span></div>
                                {a.fechaHora && (
                                    <div className="dossier-meta-dim"><Calendar size={14} /><span>{formatDate(a.fechaHora)}</span></div>
                                )}
                            </div>
                            <p className="dossier-desc">{a.description?? 'No description on file.'}</p>
                        </div>

                        {/* Center: evidence viewer */}
                        <div className="dossier-media">
                            {a.fotoUrl? (
                                <div className="hud-border dossier-photo">
                                    <img src={a.fotoUrl} alt={`Fotografía del avistamiento ${a.id}`} />
                                </div>
                            ) : (
                                <div className="hud-border dossier-photo dossier-photo-empty">NO MEDIA ON FILE</div>
                            )}
                        </div>

                        {/* Right: analysis panel */}
                        <aside className="dossier-side">
                            {a.caracteristicas && a.caracteristicas.length > 0 && (
                                <div className="hud-border dossier-panel">
                                    <span className="dossier-label">Características</span>
                                    <ul className="dossier-tags">
                                        {a.caracteristicas.map(c => <li key={c.id}>{c.nombre}</li>)}
                                    </ul>
                                </div>
                            )}
                        </aside>
                    </div>
                )
            })()}
        </section>
    )
}