import type { ServiceUser } from '../types/user.types'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

function isServiceUser(value: unknown): value is ServiceUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const user = value as Record<string, unknown>
  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    (typeof user.firstname === 'string' || user.firstname === null) &&
    (typeof user.lastname === 'string' || user.lastname === null) &&
    (user.role === 'REQUESTER' ||
      user.role === 'OPERATOR' ||
      user.role === 'MANAGER') &&
    typeof user.createdAt === 'string'
  )
}

export async function getUsers(signal?: AbortSignal): Promise<ServiceUser[]> {
  const response = await fetch(`${apiBaseUrl}/users`, { signal })
  if (!response.ok) {
    throw new Error(`Could not load users (HTTP ${response.status}).`)
  }

  const users: unknown = await response.json()
  if (!Array.isArray(users) || !users.every(isServiceUser)) {
    throw new Error('The users API returned an unexpected response.')
  }

  return users
}
