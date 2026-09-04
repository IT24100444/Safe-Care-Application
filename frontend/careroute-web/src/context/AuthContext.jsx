import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import * as authService from '../features/auth/authService.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children, service = authService }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    service.getCurrentUser().then((currentUser) => { if (active) setUser(currentUser) }).catch(() => { service.clearToken(); if (active) setUser(null) }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [service])

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    async login(credentials) { const nextUser = await service.login(credentials); setUser(nextUser); return nextUser },
    async register(details) { const nextUser = await service.register(details); setUser(nextUser); return nextUser },
    logout() { service.clearToken(); setUser(null) },
  }), [user, isLoading, service])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired, service: PropTypes.shape({ getCurrentUser: PropTypes.func.isRequired, login: PropTypes.func.isRequired, register: PropTypes.func.isRequired, clearToken: PropTypes.func.isRequired }) }
