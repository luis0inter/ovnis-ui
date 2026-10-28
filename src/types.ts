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