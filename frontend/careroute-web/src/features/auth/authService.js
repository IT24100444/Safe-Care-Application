import { apiClient, setAuthToken } from '../../services/apiClient.js'

const TOKEN_KEY = 'careroute_access_token'

export function getStoredToken() { return window.localStorage.getItem(TOKEN_KEY) }
export function storeToken(token) { window.localStorage.setItem(TOKEN_KEY, token); setAuthToken(token) }
export function clearToken() { window.localStorage.removeItem(TOKEN_KEY); setAuthToken(null) }

export async function login(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials)
  storeToken(data.data.token)
  return data.data.user
}

export async function register(details) {
  const { data } = await apiClient.post('/auth/register', details)
  storeToken(data.data.token)
  return data.data.user
}

export async function getCurrentUser() {
  const token = getStoredToken()
  if (!token) return null
  setAuthToken(token)
  const { data } = await apiClient.get('/auth/me')
  return data.data.user
}
