export interface Sighting{
    id: number
    title: string | null
    description: string | null
    location: string | null
    // Required by HU-O11 but not in the backend model yet, confirm names with Nico
    date?:string
    characteristics: string[]
    photoURL: string | null



}

// Característica mantenida por el administrador (SCRUM-34: GET /api/caracteristicas).
export interface Caracteristica {
    id: number
    nombre: string
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