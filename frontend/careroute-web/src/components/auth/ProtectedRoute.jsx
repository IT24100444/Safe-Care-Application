import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <p role="status">Loading…</p>
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
