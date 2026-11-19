import type { Role } from '../../types.ts'

interface Claims {
  sub: string
  role: Role
  exp: number
}


export function normalizeRole(value: unknown) : Role | null {
  if (typeof value!= 'string') return null

  const role = value.toUpperCase()

  if (role == 'ADMIN' || role === 'USER'){
    return role
  }
  return null
}

export function readToken(token: string): Claims | null {
  try {
    const payload = token.split('.')[1] ?? ''
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as {
      sub?: unknown
      role?:unknown
      exp?:unknown
    }
    if (
        typeof claims.sub !== 'string' ||
        typeof claims.exp !== 'number'
    ) {
      return null
    }

    const role = normalizeRole(claims.role)
    if(!role) return null
    const expired = claims.exp * 1000 <= Date.now()
    if (expired) return null
    return {
      sub: claims.sub,
      role,
      exp: claims.exp
    }
  } catch {
    return null
  }
}
