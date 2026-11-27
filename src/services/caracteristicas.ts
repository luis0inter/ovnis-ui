import { api } from '../api.ts'
import type { Caracteristica } from '../types'

// Public endpoint (SCRUM-34). The backend only returns characteristics the admin
// keeps active, so this list is already the correct catalog for HU-032's criterios 1 y 2.
export async function getCaracteristicas(): Promise<Caracteristica[]> {
    return api<Caracteristica[]>('/api/caracteristicas')
}
