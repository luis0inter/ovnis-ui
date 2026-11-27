import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../../auth/AuthContext.tsx'
import type { Caracteristica } from '../../types.ts'
import { getCaracteristicas } from '../../services/caracteristicas.ts'
import { createSighting, getSightingById, updateSighting } from '../../services/sightnings.ts'
import '../../styles/UserProfile.css'
import '../../styles/SightingForm.css'

type CharacteristicsState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'loaded'; items: Caracteristica[] }

// "YYYY-MM-DDTHH:mm" in local time, used as the <input type="datetime-local"> max
// so the picker itself keeps the user from choosing a future date.
function toDatetimeLocalMax() {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

// The backend's fechaHora comes back as "2026-10-20T22:42:00" (no timezone, matching
// what <input type="datetime-local"> expects) — just drop the seconds.
function toDatetimeLocalValue(fechaHora: string) {
    return fechaHora.slice(0, 16)
}

export default function SightingForm() {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const navigate = useNavigate()
    const { authFetch } = useAuth()
    const maxDate = useMemo(toDatetimeLocalMax, [])

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [lugar, setLugar] = useState('')
    const [ciudad, setCiudad] = useState('')
    const [region, setRegion] = useState('')
    const [fechaHora, setFechaHora] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [fotoUrl, setFotoUrl] = useState('')
    const [photoFailed, setPhotoFailed] = useState(false)

    const [characteristics, setCharacteristics] = useState<CharacteristicsState>({ status: 'loading' })
    const [prefillNotice, setPrefillNotice] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Same catalog loaded for both Nuevo and Editar (HU-032, criterios 1 y 2): only
    // characteristics the admin keeps active are offered (SCRUM-34).
    useEffect(() => {
        let cancelled = false
        getCaracteristicas()
            .then(items => { if (!cancelled) setCharacteristics({ status: 'loaded', items }) })
            .catch((err: Error) => { if (!cancelled) setCharacteristics({ status: 'error', message: err.message }) })
        return () => { cancelled = true }
    }, [])

    // HU-026 (SCRUM-78/79): prefill the full sighting when editing. This only became
    // possible once the `Sighting` type was fixed to match the backend (SCRUM-64/76) —
    // getSightingById now returns the real record instead of mock data.
    useEffect(() => {
        if (!id) return
        let cancelled = false
        getSightingById(id)
            .then(sighting => {
                if (cancelled) return
                if (!sighting) {
                    setPrefillNotice('No se pudo cargar este avistamiento para editarlo. Puede que ya no esté disponible.')
                    return
                }
                setTitle(sighting.title ?? '')
                setDescription(sighting.description ?? '')
                setLugar(sighting.lugar ?? '')
                setCiudad(sighting.ciudad ?? '')
                setRegion(sighting.region ?? '')
                if (sighting.fechaHora) setFechaHora(toDatetimeLocalValue(sighting.fechaHora))
                setSelectedIds(new Set(sighting.caracteristicas.map(c => c.id)))
                setFotoUrl(sighting.fotoUrl ?? '')
            })
            .catch((err: Error) => {
                if (!cancelled) setPrefillNotice(`No se pudieron cargar los datos existentes: ${err.message}`)
            })
        return () => { cancelled = true }
    }, [id])

    function toggleCharacteristic(charId: number) {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(charId)) next.delete(charId)
            else next.add(charId)
            return next
        })
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setSubmitError('')

        const missing: string[] = []
        if (!title.trim()) missing.push('Título')
        if (!description.trim()) missing.push('Descripción')
        if (!lugar.trim()) missing.push('Lugar')
        if (!ciudad.trim()) missing.push('Ciudad')
        if (!region.trim()) missing.push('Región')
        if (!fechaHora) missing.push('Fecha y hora')
        if (missing.length > 0) {
            setSubmitError(`Faltan campos: ${missing.join(', ')}`)
            return
        }
        if (new Date(fechaHora).getTime() > Date.now()) {
            setSubmitError('La fecha del avistamiento no puede ser futura.')
            return
        }
        // HU-032, criterio 3: no se puede publicar sin al menos una característica.
        if (selectedIds.size === 0) {
            setSubmitError('Selecciona al menos una característica.')
            return
        }

        const payload = {
            title: title.trim(),
            description: description.trim(),
            lugar: lugar.trim(),
            ciudad: ciudad.trim(),
            region: region.trim(),
            // datetime-local gives "YYYY-MM-DDTHH:mm" (no seconds); the backend's
            // LocalDateTime deserializer expects seconds.
            fechaHora: fechaHora.length === 16 ? `${fechaHora}:00` : fechaHora,
            caracteristicasIds: Array.from(selectedIds),
            // HU-005, criterio 1: la fotografía es opcional — solo se envía si el usuario puso una.
            fotoUrl: fotoUrl.trim() || undefined,
        }

        try {
            setSubmitting(true)
            // HU-006 (SCRUM-29/30): el avistamiento queda visible de inmediato (sin
            // aprobación, SCRUM-31 ya lo crea así), así que podemos ir directo a su
            // propio detalle en vez de dejar al usuario buscarlo en el listado.
            const result = isEdit && id
                ? await updateSighting(id, payload, authFetch)
                : await createSighting(payload, authFetch)
            navigate(`/sightings/${result.id}`)
        } catch (err) {
            setSubmitError((err as Error).message)
            setSubmitting(false)
        }
    }

    return (
        <main className="ov-profile sf-form" id="contenido">
            <div className="ov-profile__intro">
                <span className="ov-profile__eyebrow">// {isEdit ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}</span>
                <h1>{isEdit ? 'Editar avistamiento' : 'Nuevo avistamiento'}</h1>
                <p>{isEdit ? 'Actualiza los datos de tu reporte.' : 'Comparte un nuevo reporte con la red de observación.'}</p>
            </div>

            <form className="ov-profile__panel sf-panel" onSubmit={handleSubmit} noValidate>
                {prefillNotice && <p className="ov-profile__error" role="alert">{prefillNotice}</p>}

                <div className="sf-field">
                    <label className="sf-label" htmlFor="sf-title">Título</label>
                    <input
                        className="sf-input"
                        id="sf-title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={100}
                    />
                </div>

                <div className="sf-field">
                    <label className="sf-label" htmlFor="sf-description">Descripción</label>
                    <textarea
                        className="sf-input sf-textarea"
                        id="sf-description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={500}
                        rows={4}
                    />
                </div>

                <div className="sf-grid">
                    <div className="sf-field">
                        <label className="sf-label" htmlFor="sf-lugar">Lugar</label>
                        <input className="sf-input" id="sf-lugar" value={lugar} onChange={e => setLugar(e.target.value)} />
                    </div>
                    <div className="sf-field">
                        <label className="sf-label" htmlFor="sf-ciudad">Ciudad</label>
                        <input className="sf-input" id="sf-ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                    </div>
                    <div className="sf-field">
                        <label className="sf-label" htmlFor="sf-region">Región</label>
                        <input className="sf-input" id="sf-region" value={region} onChange={e => setRegion(e.target.value)} />
                    </div>
                </div>

                <div className="sf-field">
                    <label className="sf-label" htmlFor="sf-fecha">Fecha y hora del avistamiento</label>
                    <input
                        className="sf-input"
                        id="sf-fecha"
                        type="datetime-local"
                        value={fechaHora}
                        max={maxDate}
                        onChange={e => setFechaHora(e.target.value)}
                    />
                </div>

                <div className="sf-field">
                    <label className="sf-label" htmlFor="sf-foto">URL de la fotografía (opcional)</label>
                    <input
                        className="sf-input"
                        id="sf-foto"
                        type="url"
                        placeholder="https://..."
                        value={fotoUrl}
                        onChange={e => { setFotoUrl(e.target.value); setPhotoFailed(false) }}
                    />
                    {fotoUrl.trim() && (
                        photoFailed ? (
                            <p className="sf-hint">No se pudo cargar la vista previa de esa URL.</p>
                        ) : (
                            <div className="sf-photo-preview">
                                <img src={fotoUrl.trim()} alt="Vista previa de la fotografía" onError={() => setPhotoFailed(true)} />
                            </div>
                        )
                    )}
                </div>

                <div className="sf-field">
                    <span className="sf-label">Características</span>

                    {characteristics.status === 'loading' && (
                        <p className="sf-hint" role="status">Cargando características…</p>
                    )}

                    {characteristics.status === 'error' && (
                        <p className="ov-profile__error" role="alert">{characteristics.message}</p>
                    )}

                    {characteristics.status === 'loaded' && characteristics.items.length === 0 && (
                        <p className="sf-hint">El administrador aún no ha registrado características.</p>
                    )}

                    {characteristics.status === 'loaded' && characteristics.items.length > 0 && (
                        <div className="sf-chips" role="group" aria-label="Características disponibles">
                            {characteristics.items.map(c => {
                                const checked = selectedIds.has(c.id)
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`sf-chip${checked ? ' sf-chip--selected' : ''}`}
                                        aria-pressed={checked}
                                        onClick={() => toggleCharacteristic(c.id)}
                                    >
                                        {c.nombre}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                    <p className="sf-hint">Selecciona al menos una característica para poder publicar.</p>
                </div>

                {submitError && <p className="ov-profile__error" role="alert">{submitError}</p>}

                <div className="sf-actions">
                    <Link to="/sightings" className="sf-cancel">Cancelar</Link>
                    <button className="sf-submit" type="submit" disabled={submitting || selectedIds.size === 0}>
                        {submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Publicar avistamiento'}
                    </button>
                </div>
            </form>
        </main>
    )
}
