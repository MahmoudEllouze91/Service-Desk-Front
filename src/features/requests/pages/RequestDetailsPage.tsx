import { useEffect, useState } from 'react'
import { getRequest } from '../services/requestService'
import type { RequestDetails, RequestStatus } from '../types/request.types'

interface RequestDetailsPageProps {
  requestId: string
}

const statusStyles: Record<RequestStatus, string> = {
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
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString()
}

function formatUserName(user: RequestDetails['userCreator'] | null): string {
  if (!user) {
    return 'Not recorded'
  }
  const name = [user.firstname, user.lastname]
    .filter((part) => part !== null && part.trim().length > 0)
    .join(' ')
  return name || user.email
}

function RequestDetailsPage({ requestId }: RequestDetailsPageProps) {
  const [request, setRequest] = useState<RequestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRequest() {
      try {
        setRequest(await getRequest(requestId, controller.signal))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'An unexpected error occurred while loading the request.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadRequest()
    return () => controller.abort()
  }, [requestId])

  return (
    <main className="container py-5">
      <a className="text-decoration-none" href="/requests">
        &larr; Back to requests
      </a>

      <header className="mt-4 mb-4">
        <p className="text-uppercase small fw-semibold text-primary mb-1">
          Service desk
        </p>
        <h1 className="h2 mb-1">Request details</h1>
      </header>

      {loading ? (
        <div className="d-flex align-items-center gap-2 p-4" role="status">
          <span
            className="spinner-border spinner-border-sm text-primary"
            aria-hidden="true"
          />
          <span>Loading request…</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : request ? (
        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <section className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                  <h2 className="h3 mb-0">{request.title}</h2>
                  <span
                    className={`badge align-self-start ${statusStyles[request.status]}`}
                  >
                    {formatLabel(request.status)}
                  </span>
                </div>
                <p className="text-body-secondary mb-4">
                  {request.description}
                </p>
                <dl className="row mb-0">
                  <dt className="col-sm-4">Category</dt>
                  <dd className="col-sm-8">{request.category}</dd>
                  <dt className="col-sm-4">Urgency</dt>
                  <dd className="col-sm-8">{formatLabel(request.urgency)}</dd>
                  <dt className="col-sm-4">Creator</dt>
                  <dd className="col-sm-8">
                    {formatUserName(request.userCreator)}
                  </dd>
                  <dt className="col-sm-4">Assigned operator</dt>
                  <dd className="col-sm-8">
                    {formatUserName(request.assignedOperator)}
                  </dd>
                  <dt className="col-sm-4">Created</dt>
                  <dd className="col-sm-8 mb-0">
                    {formatDate(request.createdAt)}
                  </dd>
                </dl>
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-5">
            <section
              className="card border-0 shadow-sm"
              aria-labelledby="status-history-title"
            >
              <div className="card-header bg-white py-3">
                <h2 id="status-history-title" className="h5 mb-0">
                  Status history
                </h2>
              </div>
              {request.statusHistory.length === 0 ? (
                <p className="card-body text-body-secondary mb-0">
                  No status history has been recorded.
                </p>
              ) : (
                <ol className="list-group list-group-flush">
                  {request.statusHistory.map((entry) => (
                    <li key={entry.id} className="list-group-item px-3 py-3">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <span
                            className={`badge ${statusStyles[entry.status]}`}
                          >
                            {formatLabel(entry.status)}
                          </span>
                          <div className="small text-body-secondary mt-2">
                            Changed by {formatUserName(entry.assigningUser)}
                          </div>
                        </div>
                        <time
                          className="small text-body-secondary text-end"
                          dateTime={entry.createdAt}
                        >
                          {formatDate(entry.createdAt)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default RequestDetailsPage
