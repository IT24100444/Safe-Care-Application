import { Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/authContext.js'

export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth()
  return user && allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/profile" replace />
}

RoleRoute.propTypes = { allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired }
