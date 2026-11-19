import { useEffect, useState, type FormEvent } from 'react'
import { createRequest } from '../services/requestService'
import { getUsers } from '../services/userService'
import type { ServiceRequest, RequestUrgency } from '../types/request.types'
import type { ServiceUser } from '../types/user.types'

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
  const [users, setUsers] = useState<ServiceUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        const availableUsers = await getUsers(controller.signal)
        setUsers(availableUsers)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setUsersError(
            requestError instanceof Error
              ? requestError.message
              : 'An unexpected error occurred while loading users.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false)
        }
      }
    }

    void loadUsers()
    return () => controller.abort()
  }, [])

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

      {usersError && (
        <div className="alert alert-danger" role="alert">
          {usersError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="request-creator" className="form-label">
          Requester
        </label>
        <select
          id="request-creator"
          className="form-select"
          value={userCreatorId}
          onChange={(event) => setUserCreatorId(event.target.value)}
          required
          disabled={usersLoading || usersError !== null || users.length === 0}
          aria-describedby="creator-help"
        >
          <option value="">
            {usersLoading ? 'Loading users…' : 'Select a requester'}
          </option>
          {users.map((user) => {
            const name = [user.firstname, user.lastname]
              .filter((part) => part !== null && part.trim().length > 0)
              .join(' ')
            return (
              <option key={user.id} value={user.id}>
                {name ? `${name} (${user.email})` : user.email}
              </option>
            )
          })}
        </select>
        <div id="creator-help" className="form-text">
          {usersLoading
            ? 'Loading available users.'
            : usersError
              ? 'Users could not be loaded. Please try again later.'
              : users.length === 0
                ? 'No users are available to create a request.'
                : 'Choose the user submitting this request.'}
        </div>
      </div>

      <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2">
        <a className="btn btn-outline-secondary" href="/requests">
          Cancel
        </a>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={
            submitting ||
            usersLoading ||
            usersError !== null ||
            users.length === 0
          }
        >
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
