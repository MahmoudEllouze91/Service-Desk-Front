export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED'

export type RequestUrgency = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
export type RequestSortBy = 'createdAt' | 'title' | 'status'
export type RequestSortOrder = 'asc' | 'desc'

export interface ServiceRequest {
  id: string
  title: string
  description: string
  category: string
  status: RequestStatus
  urgency: RequestUrgency
  userCreatorId: string
  assignedOperatorId: string | null
  createdAt: string
}

export interface CreateRequestInput {
  title: string
  description: string
  category: string
  status: RequestStatus
  urgency: RequestUrgency
  userCreatorId: string
}

export interface PaginatedRequests {
  items: ServiceRequest[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}