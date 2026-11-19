import { api, ApiError } from '../api.ts'
import type { Sighting } from '../types'
import { MOCK_SIGNTHINGS } from './mockSightings.ts'

const USE_MOCK = true

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
