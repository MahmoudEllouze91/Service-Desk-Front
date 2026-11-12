import type {
  CreateRequestInput,
  PaginatedRequests,
  RequestSortBy,
  RequestSortOrder,
  RequestStatus,
  ServiceRequest,
} from '../types/request.types'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

function isServiceRequest(value: unknown): value is ServiceRequest {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const request = value as Record<string, unknown>
  return (
    typeof request.id === 'string' &&
    typeof request.title === 'string' &&
    typeof request.description === 'string' &&
    typeof request.category === 'string' &&
    (request.status === 'NEW' ||
      request.status === 'IN_PROGRESS' ||
      request.status === 'RESOLVED') &&
    (request.urgency === 'LOW' ||
      request.urgency === 'NORMAL' ||
      request.urgency === 'HIGH' ||
      request.urgency === 'CRITICAL') &&
    typeof request.userCreatorId === 'string' &&
    (typeof request.assignedOperatorId === 'string' ||
      request.assignedOperatorId === null) &&
    typeof request.createdAt === 'string'
  )
}

function isPaginatedRequests(value: unknown): value is PaginatedRequests {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const result = value as Record<string, unknown>
  return (
    Array.isArray(result.items) &&
    result.items.every(isServiceRequest) &&
    Number.isSafeInteger(result.page) &&
    Number.isSafeInteger(result.pageSize) &&
    Number.isSafeInteger(result.total) &&
    Number.isSafeInteger(result.totalPages)
  )
}

export async function getRequests(
  page: number,
  pageSize: number,
  filters: {
    title: string
    status: RequestStatus | ''
    sortBy: RequestSortBy
    sortOrder: RequestSortOrder
  },
  signal?: AbortSignal,
): Promise<PaginatedRequests> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })
  if (filters.title.trim()) {
    query.set('title', filters.title.trim())
  }
  if (filters.status) {
    query.set('status', filters.status)
  }
  const response = await fetch(`${apiBaseUrl}/requests?${query}`, { signal })
  if (!response.ok) {
    throw new Error(`Could not load requests (HTTP ${response.status}).`)
  }

  const requests: unknown = await response.json()
  if (!isPaginatedRequests(requests)) {
    throw new Error('The requests API returned an unexpected response.')
  }

  return requests
}

export async function createRequest(
  request: CreateRequestInput,
): Promise<ServiceRequest> {
  const response = await fetch(`${apiBaseUrl}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Could not create request (HTTP ${response.status}).`)
  }

  const createdRequest: unknown = await response.json()
  if (!isServiceRequest(createdRequest)) {
    throw new Error('The requests API returned an unexpected response.')
  }

  return createdRequest
}