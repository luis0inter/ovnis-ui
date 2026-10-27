import type {Sighting} from "../types.ts";

export const MOCK_SIGNTHINGS: Sighting [] = [
    // Full record: what HU-011 needs once the backend adds the missing fields
    { id: 1, title: 'Las Luces de la Sierra',
        description: 'Varios testigos reportaron una formación de luces silenciosas sobre la sierra.',
        location: 'Ensenada, Baja California, MX', date: '2026-10-20T22:42:00-07:00',
        characteristics: ['Luces', 'Formación', 'Silencioso'], photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkbIRrtl0_Gj6iqmORBjbDnmE1XlEHoxjlPXe-tTSOFTXyuJDRpe2OXCSB&s=10' },
    // Exactly what Nico's entity returns today
    { id: 2, title: 'Objeto silencioso', description: 'Pasó a baja altura sin hacer ruido.',
        location: 'Tijuana, Baja California, MX', date: '2026-10-20T22:42:00-07:00',
        characteristics: ['Luces', 'Formación', 'Silencioso'], photoURL: '/vite.svg'  },
    // Nulls from the database
    { id: 3, title: null, description: null, location: 'Mexicali, Baja California, MX',
        characteristics: ['Esferas', 'Rápido'], photoURL: '/vite.svg' },
]