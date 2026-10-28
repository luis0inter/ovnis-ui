import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, UserRound } from 'lucide-react'
import { useAuth } from '../../../auth/AuthContext.tsx'
import type { Sighting } from '../../../types.ts'
import './../../../styles/UserProfile.css'

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'loaded'; items: Sighting[] }

function formatDate(date?: string) {
    if (!date) return 'Fecha no disponible'
    const value = new Date(date)
    if (Number.isNaN(value.getTime())) return 'Fecha no disponible'
    return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric', month: 'short', year: 'numeric',
    }).format(value)
}

export default function UserProfile() {
    const { user, authFetch } = useAuth()
    const [data, setData] = useState<LoadState>({ status: 'loading' })
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        if (!user) return
        let active = true
        setData({ status: 'loading' })



        return () => { active = false }
    }, [user?.username, authFetch])



    return (
        <main className="ov-profile" id="contenido">
            <div className="ov-profile__intro">
                <span className="ov-profile__eyebrow">// ARCHIVO PERSONAL</span>
                <h1>Mi perfil</h1>
                <p>Tus registros dentro de la red de observación.</p>
            </div>

            <div className="ov-profile__columns">
                {/* Columna izquierda: datos del usuario */}
                <aside className="ov-profile__panel ov-profile__identity" aria-label="Datos del usuario">
                    <div className="ov-profile__user">
                        <div className="ov-profile__avatar" aria-hidden="true">
                            <UserRound size={23} strokeWidth={1.7} />
                        </div>
                        <div className="ov-profile__user-info">
                            <h2>{user?.username === 'observador_demo' ? 'Observador' : (user?.username ?? 'Observador')}</h2>
                            <span>@{user?.username ?? 'usuario'}</span>
                        </div>
                    </div>

                    <div className="ov-profile__rule" />

                    <dl className="ov-profile__account">
                        <dt>TIPO DE CUENTA</dt>
                        <dd>{user?.role === 'ADMIN' ? 'Administrador' : 'Usuario registrado'}</dd>
                    </dl>
                </aside>

                {/* Columna derecha: historial de avistamientos */}
                <section className="ov-profile__panel ov-profile__history" aria-labelledby="ov-profile-history-title">
                    <div className="ov-profile__history-head">
                        <h2 id="ov-profile-history-title">Mis avistamientos</h2>
                        <span>Historial</span>
                    </div>

                    <div className="ov-profile__rule" />

                    {actionError && <p className="ov-profile__error" role="alert">{actionError}</p>}

                    {data.status === 'loading' && (
                        <p className="ov-profile__message" role="status">Cargando tus avistamientos...</p>
                    )}

                    {data.status === 'error' && (
                        <p className="ov-profile__error" role="alert">{data.message}</p>
                    )}

                    {data.status === 'loaded' && data.items.length === 0 && (
                        <div className="ov-profile__empty">
                            <h3>Aún no tienes avistamientos</h3>
                            <p>Cuando publiques uno, aparecerá en tu historial.</p>
                        </div>
                    )}

                    {data.status === 'loaded' && data.items.map(sighting => (
                        <article className="ov-profile__record" key={sighting.id}>
                            <div className="ov-profile__record-top">
                                <div className="ov-profile__record-text">
                                    <h3>{sighting.title ?? 'Registro de avistamiento'}</h3>
                                    <p>{formatDate(sighting.date)} · {sighting.location ?? 'Ubicación no disponible'}</p>
                                </div>
                                <Link
                                    to={`/sightings/${sighting.id}`}
                                    aria-label={`Ver detalle de ${sighting.title ?? 'avistamiento'}`}
                                    className="ov-profile__record-arrow"
                                >
                                    <ChevronRight size={22} strokeWidth={1.8} />
                                </Link>
                            </div>

                            <div className="ov-profile__actions">
                                <Link to={`/sightings/${sighting.id}`}>Ver detalle</Link>
                                <Link to={`/user/sightings/${sighting.id}/edit`}>Editar</Link>
                                <button
                                    type="button"

                                    disabled={deletingId !== null}
                                >
                                    {deletingId === sighting.id ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    )
}
