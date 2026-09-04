import axios from 'axios'

export const apiClient = axios.create({ baseURL: import.meta.env.VITE_NODE_API_BASE_URL ?? 'http://localhost:5000/api/v1', timeout: 10000, headers: { Accept: 'application/json' } })

export function setAuthToken(token) {
  if (token) apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete apiClient.defaults.headers.common.Authorization
}
