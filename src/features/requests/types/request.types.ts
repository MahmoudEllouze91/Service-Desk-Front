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

export interface RequestUserSummary {
  firstname: string | null
  lastname: string | null
  email: string
}

export interface RequestListItem extends ServiceRequest {
  userCreator: RequestUserSummary
  assignedOperator: RequestUserSummary | null
}

export interface RequestStatusHistory {
  id: string
  status: RequestStatus
  requestId: string
  assigningUserId: string | null
  assigningUser: RequestUserSummary | null
  createdAt: string
}

export interface RequestDetails extends RequestListItem {
  statusHistory: RequestStatusHistory[]
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
  items: RequestListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
