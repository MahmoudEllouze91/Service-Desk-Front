import RequestPage from '../features/requests/pages/RequestPage'
import CreateRequestPage from '../features/requests/pages/CreateRequestPage'
import RequestDetailsPage from '../features/requests/pages/RequestDetailsPage'

function AppRouter() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/' || path === '/requests') {
    return <RequestPage />
  }

  if (path === '/requests/new') {
    return <CreateRequestPage />
  }

  const requestDetailsMatch = path.match(/^\/requests\/([^/]+)$/)
  if (requestDetailsMatch) {
    return (
      <RequestDetailsPage
        requestId={decodeURIComponent(requestDetailsMatch[1])}
      />
    )
  }

  return (
    <main className="container py-5">
      <h1 className="h2">Page not found</h1>
      <a href="/requests">View requests</a>
    </main>
  )
}

export default AppRouter
