// Característica mantenida por el administrador (SCRUM-34: GET /api/caracteristicas).
export interface Caracteristica {
    id: number
    nombre: string
}

// Mirrors the backend's SightingResponse exactly (confirmed against ovnis_api's
// SightingController/SightingResponse). Fixes the field-name mismatch reported in
// SCRUM-36/76 (the old `location`/`date`/`photoURL`/`characteristics: string[]` never
// matched what the API actually returns, so every real sighting rendered as "not available").
// Only the fields the UI currently consumes are modeled; the backend exposes more
// (latitud, longitud, creator, visible, duracionSegundos, altitud, nivelCredibilidad,
// comments) that no screen needs yet.
export interface Sighting {
    id: number
    title: string | null
    description: string | null
    lugar: string | null
    ciudad: string | null
    region: string | null
    fechaHora: string | null
    caracteristicas: Caracteristica[]
    fotoUrl: string | null
}

// SCRUM-32/33: payload for POST/PUT /api/sightings. Mirrors the backend's SightingRequest
// field names exactly (lugar/ciudad/region split, fechaHora, caracteristicasIds) instead of
// reusing the display-oriented `Sighting` type above, which is known to mismatch the backend
// response shape (see SCRUM-36 comment).
export interface SightingFormInput {
    title: string
    description: string
    lugar: string
    ciudad: string
    region: string
    fechaHora: string
    caracteristicasIds: number[]
}