import { useState, type FormEvent } from 'react'
import { createRequest } from '../services/requestService'
import type { ServiceRequest, RequestUrgency } from '../types/request.types'

interface RequestFormProps {
  onCreated: (request: ServiceRequest) => void
}

const urgencyOptions: { value: RequestUrgency; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

function RequestForm({ onCreated }: RequestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [urgency, setUrgency] = useState<RequestUrgency>('NORMAL')
  const [userCreatorId, setUserCreatorId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const request = await createRequest({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        status: 'NEW',
        urgency,
        userCreatorId: userCreatorId.trim(),
      })
      onCreated(request)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'An unexpected error occurred while creating the request.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="request-title" className="form-label">
          Title
        </label>
        <input
          id="request-title"
          className="form-control"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="request-description" className="form-label">
          Description
        </label>
        <textarea
          id="request-description"
          className="form-control"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label htmlFor="request-category" className="form-label">
            Category
          </label>
          <input
            id="request-category"
            className="form-control"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. Hardware, Software, Access"
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="request-urgency" className="form-label">
            Urgency
          </label>
          <select
            id="request-urgency"
            className="form-select"
            value={urgency}
            onChange={(event) => {
              const selectedUrgency = urgencyOptions.find(
                (option) => option.value === event.target.value,
              )
              if (selectedUrgency) {
                setUrgency(selectedUrgency.value)
              }
            }}
          >
            {urgencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="request-creator" className="form-label">
          Creator ID
        </label>
        <input
          id="request-creator"
          className="form-control"
          type="text"
          value={userCreatorId}
          onChange={(event) => setUserCreatorId(event.target.value)}
          required
          autoComplete="off"
          aria-describedby="creator-help"
        />
        <div id="creator-help" className="form-text">
          Enter the ID of the requester who is submitting this request.
        </div>
      </div>

      <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2">
        <a className="btn btn-outline-secondary" href="/requests">
          Cancel
        </a>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              />
              Submitting…
            </>
          ) : (
            'Submit request'
          )}
        </button>
      </div>
    </form>
  )
}

export default RequestForm