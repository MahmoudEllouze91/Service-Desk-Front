import { useEffect, useState } from 'react'
import { getRequests } from '../services/requestService'
import type {
  RequestSortBy,
  RequestSortOrder,
  RequestStatus,
  ServiceRequest,
} from '../types/request.types'

export function useRequest() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [titleFilter, setTitleFilterState] = useState('')
  const [statusFilter, setStatusFilterState] = useState<RequestStatus | ''>('')
  const [sortBy, setSortByState] = useState<RequestSortBy>('createdAt')
  const [sortOrder, setSortOrderState] = useState<RequestSortOrder>('desc')
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRequests() {
      try {
        const result = await getRequests(
          page,
          pageSize,
          { title: titleFilter, status: statusFilter, sortBy, sortOrder },
          controller.signal,
        )
        if (result.page > result.totalPages) {
          setPage(result.totalPages)
          return
        }
        setRequests(result.items)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'An unexpected error occurred while loading requests.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)
      void loadRequests()
    }, 250)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [
    page,
    pageSize,
    titleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    reloadKey,
  ])

  return {
    requests,
    page,
    pageSize,
    titleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    total,
    totalPages,
    loading,
    error,
    setPage,
    setPageSize: (newPageSize: number) => {
      setPageSize(newPageSize)
      setPage(1)
    },
    setTitleFilter: (value: string) => {
      setTitleFilterState(value)
      setPage(1)
    },
    setStatusFilter: (value: RequestStatus | '') => {
      setStatusFilterState(value)
      setPage(1)
    },
    setSortBy: (value: RequestSortBy) => {
      setSortByState(value)
      setPage(1)
    },
    setSortOrder: (value: RequestSortOrder) => {
      setSortOrderState(value)
      setPage(1)
    },
    reload: () => setReloadKey((key) => key + 1),
  }
}