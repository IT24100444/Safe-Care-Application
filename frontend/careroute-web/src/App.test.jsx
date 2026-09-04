import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import './locales/i18n.js'
import { AuthProvider } from './context/AuthContext.jsx'

vi.mock('./features/facilities/facilityService.js', () => ({ getFacilities: vi.fn().mockResolvedValue({ items: [], count: 0 }), createFacility: vi.fn(), updateFacility: vi.fn(), deactivateFacility: vi.fn(), getFacility: vi.fn() }))
vi.mock('./features/services/healthServiceService.js', () => ({ getHealthServices: vi.fn().mockResolvedValue({ items: [], count: 0 }), createHealthService: vi.fn(), updateHealthService: vi.fn(), deactivateHealthService: vi.fn() }))

function renderApp(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><App /></AuthProvider></MemoryRouter>)
}

const patient = { name: 'Test Patient', email: 'patient@example.com', role: 'PATIENT', preferredLanguage: 'en' }
const authenticatedService = { getCurrentUser: async () => patient, login: async () => patient, register: async () => patient, clearToken: vi.fn() }

test('renders the application shell and ready status', async () => {
  renderApp()
  expect(screen.getByRole('heading', { name: 'CareRoute LK' })).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Ready for feature development')
  await screen.findByRole('link', { name: 'Login' })
})

test('renders login fields', async () => {
  renderApp('/login')
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  await screen.findByRole('button', { name: 'Login' })
})

test('public registration has required identity fields but no role selector', async () => {
  renderApp('/register')
  expect(screen.getByLabelText('Name')).toBeInTheDocument()
  expect(screen.getByLabelText('Preferred language')).toBeInTheDocument()
  expect(screen.queryByLabelText('Role')).not.toBeInTheDocument()
  await screen.findByRole('button', { name: 'Register' })
})

test('protected profile redirects an unauthenticated visitor', async () => {
  renderApp('/profile')
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

test('authenticated user can view safe profile fields and logout', async () => {
  render(<MemoryRouter initialEntries={['/profile']}><AuthProvider service={authenticatedService}><App /></AuthProvider></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  expect(screen.getByText('patient@example.com')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
  expect(authenticatedService.clearToken).toHaveBeenCalled()
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

test.each(['PATIENT', 'DOCTOR'])('%s cannot access admin facilities', async (role) => {
  const service = { ...authenticatedService, getCurrentUser: async () => ({ ...patient, role }) }
  render(<MemoryRouter initialEntries={['/admin/facilities']}><AuthProvider service={service}><App /></AuthProvider></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument()
})

test('unauthenticated visitor cannot access admin services', async () => {
  renderApp('/admin/services')
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

test('ADMIN can access facility management and sees admin navigation', async () => {
  const service = { ...authenticatedService, getCurrentUser: async () => ({ ...patient, role: 'ADMIN' }) }
  render(<MemoryRouter initialEntries={['/admin/facilities']}><AuthProvider service={service}><App /></AuthProvider></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: 'Manage healthcare facilities' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Manage services' })).toBeInTheDocument()
})
