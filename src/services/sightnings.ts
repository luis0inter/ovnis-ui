import { api, ApiError } from '../api.ts'
import type { AuthedFetch } from '../auth/AuthContext.tsx'
import type { Sighting, SightingFormInput } from '../types'
import { MOCK_SIGNTHINGS } from './mockSightings.ts'

const USE_MOCK = true

// SCRUM-36: public listing endpoint (SCRUM-37, backend) already excludes
// sightings hidden by moderation, so it's safe for visitors and registered users alike.
export async function getSightings(): Promise<Sighting[]> {
    return api<Sighting[]>('/api/sightings')
}

//Returns null when sigthing doesn't exist (404) so the page can show "not found".
export async function getSightingById(id: string): Promise<Sighting | null> {
  if (USE_MOCK) {
    return MOCK_SIGNTHINGS.find((sighting) => String(sighting.id) === id) ?? null
  }

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
