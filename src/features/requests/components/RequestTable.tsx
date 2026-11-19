import { useEffect, useRef, useState } from 'react'
import type {
  RequestSortBy,
  RequestSortOrder,
  RequestListItem,
} from '../types/request.types'

interface RequestTableProps {
  requests: RequestListItem[]
  sortBy: RequestSortBy
  sortOrder: RequestSortOrder
  onSort: (column: RequestSortBy) => void
  onAdvanceStatus: (requestId: string) => Promise<void>
}

const urgencyStyles: Record<RequestListItem['urgency'], string> = {
  LOW: 'text-bg-secondary',
  NORMAL: 'text-bg-info',
  HIGH: 'text-bg-warning',
  CRITICAL: 'text-bg-danger',
}

const statusStyles: Record<RequestListItem['status'], string> = {
  NEW: 'text-bg-primary',
  IN_PROGRESS: 'text-bg-warning',
  RESOLVED: 'text-bg-success',
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown'
    : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function formatUserName(user: RequestListItem['userCreator']) {
  const name = [user.firstname, user.lastname]
    .filter((part) => part !== null && part.trim().length > 0)
    .join(' ')
  return name || user.email
}

interface SortableHeaderProps {
  label: string
  column: RequestSortBy
  sortBy: RequestSortBy
  sortOrder: RequestSortOrder
  onSort: (column: RequestSortBy) => void
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortBy === column
  const nextOrder = isActive && sortOrder === 'desc' ? 'asc' : 'desc'
  const arrow = isActive ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'

  return (
    <th
      scope="col"
      aria-sort={
        isActive ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        className="request-table__sort"
        onClick={() => onSort(column)}
        aria-label={
          isActive
            ? `${label}, sorted ${sortOrder}; activate to sort ${nextOrder}`
            : `Sort by ${label} in descending order`
        }
      >
        {label}
        <span aria-hidden="true">{arrow}</span>
      </button>
    </th>
  )
}

function RequestTable({
  requests,
  sortBy,
  sortOrder,
  onSort,
  onAdvanceStatus,
}: RequestTableProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<RequestListItem | null>(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (selectedRequest && !dialog.open) {
      dialog.showModal()
    } else if (!selectedRequest && dialog.open) {
      dialog.close()
    }
  }, [selectedRequest])

  function closeDialog() {
    if (!changingStatus) {
      dialogRef.current?.close()
      setSelectedRequest(null)
      setStatusError(null)
    }
  }

  async function confirmStatusChange() {
    if (!selectedRequest) return

    setChangingStatus(true)
    setStatusError(null)
    try {
      await onAdvanceStatus(selectedRequest.id)
      dialogRef.current?.close()
      setSelectedRequest(null)
    } catch (requestError) {
      setStatusError(
        requestError instanceof Error
          ? requestError.message
          : 'An unexpected error occurred while changing the status.',
      )
    } finally {
      setChangingStatus(false)
    }
  }

  const nextStatus =
    selectedRequest?.status === 'NEW'
      ? 'IN_PROGRESS'
      : selectedRequest?.status === 'IN_PROGRESS'
        ? 'RESOLVED'
        : null

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 request-table">
          <thead className="table-light">
            <tr>
              <SortableHeader
                label="Title"
                column="title"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th scope="col">Category</th>
              <SortableHeader
                label="Status"
                column="status"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th scope="col">Urgency</th>
              <th scope="col">Creator</th>
              <th scope="col">Assigned operator</th>
              <SortableHeader
                label="Date created"
                column="createdAt"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="request-table__summary">
                  <a
                    className="fw-semibold text-decoration-none"
                    href={`/requests/${encodeURIComponent(request.id)}`}
                  >
                    {request.title}
                  </a>
                </td>
                <td>{request.category}</td>
                <td>
                  <span className={`badge ${statusStyles[request.status]}`}>
                    {formatLabel(request.status)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${urgencyStyles[request.urgency]}`}>
                    {formatLabel(request.urgency)}
                  </span>
                </td>
                <td>{formatUserName(request.userCreator)}</td>
                <td>
                  {request.assignedOperator ? (
                    formatUserName(request.assignedOperator)
                  ) : (
                    <span className="text-body-secondary font-sans">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="text-nowrap">{formatDate(request.createdAt)}</td>
                <td>
                  {request.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      aria-label={`Advance ${request.title} to ${formatLabel(
                        request.status === 'NEW' ? 'IN_PROGRESS' : 'RESOLVED',
                      )}`}
                      title="Advance request status"
                      onClick={() => {
                        setStatusError(null)
                        setSelectedRequest(request)
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 1 1 .908-.418A6 6 0 1 1 8 2z" />
                        <path d="M8 4.5a.5.5 0 0 1 .5.5v3.25l2.25 1.35a.5.5 0 1 1-.514.858l-2.5-1.5A.5.5 0 0 1 7.5 8.5V5a.5.5 0 0 1 .5-.5" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dialog
        ref={dialogRef}
        className="request-status-dialog"
        aria-labelledby="status-confirmation-title"
        onClose={() => {
          setSelectedRequest(null)
          setStatusError(null)
        }}
        onCancel={(event) => {
          if (changingStatus) event.preventDefault()
        }}
      >
        {selectedRequest && nextStatus && (
          <div className="card border-0 shadow">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h2 id="status-confirmation-title" className="h5 mb-0">
                Change request status?
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeDialog}
                disabled={changingStatus}
              />
            </div>
            <div className="card-body">
              <p>
                Advance <strong>{selectedRequest.title}</strong> from{' '}
                <strong>{formatLabel(selectedRequest.status)}</strong> to{' '}
                <strong>{formatLabel(nextStatus)}</strong>?
              </p>
              {statusError && (
                <div className="alert alert-danger mb-0" role="alert">
                  {statusError}
                </div>
              )}
            </div>
            <div className="card-footer bg-white d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeDialog}
                disabled={changingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void confirmStatusChange()}
                disabled={changingStatus}
              >
                {changingStatus ? 'Changing…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}

export default RequestTable
