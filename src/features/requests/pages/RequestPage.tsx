import RequestTable from "../components/RequestTable";
import { useRequest } from "../hooks/useRequest";

function RequestPage() {
  const {
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
    setPageSize,
    setTitleFilter,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    reload,
  } = useRequest();

  return (
    <main className="container py-5">
      <header className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-1">
            Service desk
          </p>
          <h1 className="h2 mb-1">Requests</h1>
          <p className="text-body-secondary mb-0">
            View and track submitted service requests.
          </p>
        </div>
        <a className="btn btn-primary" href="/requests/new">
          Create request
        </a>
      </header>

      <section
        className="card border-0 shadow-sm"
        aria-labelledby="requests-heading"
      >
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
          <h2 id="requests-heading" className="h5 mb-0">
            All requests
          </h2>
          {!loading && !error && (
            <span className="badge rounded-pill text-bg-light">
              {total} {total === 1 ? "request" : "requests"}
            </span>
          )}
        </div>

        <div className="card-body border-bottom">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6 col-xl-6">
              <label htmlFor="request-title-filter" className="form-label">
                Filter by title
              </label>
              <input
                id="request-title-filter"
                className="form-control"
                type="search"
                placeholder="Search request titles"
                value={titleFilter}
                onChange={(event) => setTitleFilter(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 col-xl-6">
              <label htmlFor="request-status-filter" className="form-label">
                Filter by status
              </label>
              <select
                id="request-status-filter"
                className="form-select"
                value={statusFilter}
                onChange={(event) => {
                  const value = event.target.value
                  if (
                    value === '' ||
                    value === 'NEW' ||
                    value === 'IN_PROGRESS' ||
                    value === 'RESOLVED'
                  ) {
                    setStatusFilter(value)
                  }
                }}
              >
                <option value="">All statuses</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center gap-2 p-4" role="status">
            <span
              className="spinner-border spinner-border-sm text-primary"
              aria-hidden="true"
            />
            <span>Loading requests…</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-4 mb-0" role="alert">
            <p className="mb-2">{error}</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={reload}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {requests.length === 0 ? (
              <div className="text-center text-body-secondary py-5">
                <p className="fw-semibold mb-1">No matching requests</p>
                <p className="mb-0">
                  Try adjusting the title or status filters.
                </p>
              </div>
            ) : (
              <RequestTable
                requests={requests}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(column) => {
                  if (sortBy === column) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy(column);
                    setSortOrder("desc");
                  }
                }}
              />
            )}
            <div className="card-footer bg-white d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div className="small text-body-secondary" aria-live="polite">
                {total === 0
                  ? "No requests to display"
                  : `Showing ${(page - 1) * pageSize + 1}–${Math.min(
                      page * pageSize,
                      total,
                    )} of ${total}`}
              </div>
              <div className="d-flex align-items-center gap-3">
                <label
                  className="d-flex align-items-center gap-2 small text-nowrap"
                  htmlFor="requests-page-size"
                >
                  Per page
                  <select
                    id="requests-page-size"
                    className="form-select form-select-sm"
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                  >
                    {[10, 25, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <nav aria-label="Request pages">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item${page <= 1 ? " disabled" : ""}`}>
                      <button
                        className="page-link"
                        type="button"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1 || loading}
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">
                        Page {page} of {totalPages}
                      </span>
                    </li>
                    <li
                      className={`page-item${page >= totalPages ? " disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        type="button"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages || loading}
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default RequestPage;
