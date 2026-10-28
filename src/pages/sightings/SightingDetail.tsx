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

const LIST_ROUTE = '/sightings' // must confirm route with Manuel
function formatDate(iso: string) {
    const d = new Date(iso)
    const date = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    return `${date} // ${hora}`
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
                                <div><MapPin size={14} /><span>{a.location ?? 'Location unknown'}</span></div>
                                {a.date && (
                                    <div className="dossier-meta-dim"><Calendar size={14} /><span>{formatDate(a.date)}</span></div>
                                )}
                            </div>
                            <p className="dossier-desc">{a.description?? 'No description on file.'}</p>
                        </div>

                        {/* Center: evidence viewer */}
                        <div className="dossier-media">
                            {a.photoURL? (
                                <div className="hud-border dossier-photo">
                                    <img src={a.photoURL} alt={`Fotografía del avistamiento ${a.id}`} />
                                </div>
                            ) : (
                                <div className="hud-border dossier-photo dossier-photo-empty">NO MEDIA ON FILE</div>
                            )}
                        </div>

                        {/* Right: analysis panel */}
                        <aside className="dossier-side">
                            {a.characteristics && a.characteristics.length > 0 && (
                                <div className="hud-border dossier-panel">
                                    <span className="dossier-label">Características</span>
                                    <ul className="dossier-tags">
                                        {a.characteristics.map(c => <li key={c}>{c}</li>)}
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