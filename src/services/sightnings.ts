import { api, ApiError } from '../api.ts'
import type { AuthedFetch } from '../auth/AuthContext.tsx'
import type { Sighting, SightingFormInput } from '../types'

// HU-014 (SCRUM-63/64): the backend does an exact (case-insensitive) match on ciudad/region,
// not a "contains" search, so these must be real values picked from a dropdown, not free text.
export interface SightingFilters {
  ciudad?: string
  region?: string
}

// SCRUM-36: public listing endpoint (SCRUM-37, backend) already excludes
// sightings hidden by moderation, so it's safe for visitors and registered users alike.
export async function getSightings(filters: SightingFilters = {}): Promise<Sighting[]> {
    const params = new URLSearchParams()
    if (filters.ciudad) params.set('ciudad', filters.ciudad)
    if (filters.region) params.set('region', filters.region)
    const query = params.toString()
    return api<Sighting[]>(`/api/sightings${query ? `?${query}` : ''}`)
}

// HU-025 (SCRUM-75/76): the backend already scopes this to the authenticated user
// (jwt.getSubject()), so the response can never include another user's sightings.
export async function getMySightings(authFetch: AuthedFetch): Promise<Sighting[]> {
  return authFetch<Sighting[]>('/api/user/me/sightings')
}

//Returns null when sigthing doesn't exist (404) so the page can show "not found".
export async function getSightingById(id: string): Promise<Sighting | null> {
  try {
    return await api<Sighting>(`/api/sightings/${encodeURIComponent(id)}`)
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// Response only used for its id, to redirect after a successful create/update (SCRUM-32/33).
export interface CreatedSighting {
  id: number
}

export async function createSighting(payload: SightingFormInput, authFetch: AuthedFetch): Promise<CreatedSighting> {
  return authFetch<CreatedSighting>('/api/sightings', { method: 'POST', body: payload })
}

export async function updateSighting(id: string, payload: SightingFormInput, authFetch: AuthedFetch): Promise<CreatedSighting> {
  return authFetch<CreatedSighting>(`/api/sightings/${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
}
