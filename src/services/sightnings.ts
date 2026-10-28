import { api, ApiError } from '../api.ts'
import type {Sighting} from '../types'
import {MOCK_SIGNTHINGS} from "./mockSightings.ts";

const USE_MOCK = true

//Returns null when sigthing doesn't exist (404) so the page can show "not found".

export async function getSightingById(id: string): Promise<Sighting | null>{
    if (USE_MOCK) {
        return MOCK_SIGNTHINGS.find(a => String(a.id) === id) ?? null
        try{
            return await api<Sighting> (`/api/sightings/${encodeURIComponent(id)}`)
        }catch(err){
            if (err instanceof ApiError && err.status === 404) return null
            throw err
        }
    }
}
