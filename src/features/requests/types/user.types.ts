export type UserRole = 'REQUESTER' | 'OPERATOR' | 'MANAGER'

export interface ServiceUser {
  id: string
  email: string
  firstname: string | null
  lastname: string | null
  role: UserRole
  createdAt: string
}
