import { useState } from 'react'
import RequestForm from '../components/RequestForm'
import type { ServiceRequest } from '../types/request.types'

function CreateRequestPage() {
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(
    null,
  )

  return (
    <main className="container py-5">
      <a className="text-decoration-none" href="/requests">
        &larr; Back to requests
      </a>

      <header className="mt-4 mb-4">
        <p className="text-uppercase small fw-semibold text-primary mb-1">
          Service desk
        </p>
        <h1 className="h2 mb-1">Create a request</h1>
        <p className="text-body-secondary mb-0">
          Describe what you need help with and submit it to the service desk.
        </p>
      </header>

      {createdRequest && (
        <div className="alert alert-success" role="status">
          <p className="fw-semibold mb-1">Request submitted successfully.</p>
          <p className="mb-0">
            Request ID: <span className="font-monospace">{createdRequest.id}</span>
            {' · '}
            <a href="/requests">View all requests</a>
          </p>
        </div>
      )}

      {!createdRequest && (
        <section className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <RequestForm onCreated={setCreatedRequest} />
          </div>
        </section>
      )}
    </main>
  )
}

export default CreateRequestPage