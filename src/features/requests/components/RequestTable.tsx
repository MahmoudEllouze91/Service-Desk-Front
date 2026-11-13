import type {
  RequestSortBy,
  RequestSortOrder,
  ServiceRequest,
} from '../types/request.types'

interface RequestTableProps {
  requests: ServiceRequest[]
  sortBy: RequestSortBy
  sortOrder: RequestSortOrder
  onSort: (column: RequestSortBy) => void
}

const statusStyles: Record<ServiceRequest['status'], string> = {
  NEW: 'text-bg-primary',
  IN_PROGRESS: 'text-bg-warning',
  RESOLVED: 'text-bg-success',
}

const urgencyStyles: Record<ServiceRequest['urgency'], string> = {
  LOW: 'text-bg-secondary',
  NORMAL: 'text-bg-info',
  HIGH: 'text-bg-warning',
  CRITICAL: 'text-bg-danger',
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
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
        isActive
          ? sortOrder === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
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
}: RequestTableProps) {
  return (
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
            <th scope="col">Creator ID</th>
            <th scope="col">Assigned operator</th>
            <SortableHeader
              label="Date created"
              column="createdAt"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="request-table__summary">
                <div className="fw-semibold">{request.title}</div>
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
              <td className="font-monospace small">{request.userCreatorId}</td>
              <td className="font-monospace small">
                {request.assignedOperatorId ?? (
                  <span className="text-body-secondary font-sans">Unassigned</span>
                )}
              </td>
              <td className="text-nowrap">{formatDate(request.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RequestTable