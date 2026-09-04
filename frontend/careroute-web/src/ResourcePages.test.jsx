import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import FacilitiesPage from './pages/FacilitiesPage.jsx'
import FacilityDetailsPage from './pages/FacilityDetailsPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import AdminFacilitiesPage from './pages/AdminFacilitiesPage.jsx'
import AdminServicesPage from './pages/AdminServicesPage.jsx'

const facilitiesApi = vi.hoisted(() => ({ getFacilities: vi.fn(), getFacility: vi.fn(), createFacility: vi.fn(), updateFacility: vi.fn(), deactivateFacility: vi.fn() }))
const servicesApi = vi.hoisted(() => ({ getHealthServices: vi.fn(), createHealthService: vi.fn(), updateHealthService: vi.fn(), deactivateHealthService: vi.fn() }))
vi.mock('./features/facilities/facilityService.js', () => facilitiesApi)
vi.mock('./features/services/healthServiceService.js', () => servicesApi)
const service = { id: 's1', name: 'General Medicine', category: 'General', description: '' }
const facility = { id: 'f1', name: 'Demo Family Clinic', facilityType: 'CLINIC', district: 'Colombo', address: 'Demo address', contactNumber: '', supportedLanguages: ['en'], healthServices: [service], emergencyAvailable: false, description: 'Demo record' }
beforeEach(() => { vi.clearAllMocks(); servicesApi.getHealthServices.mockResolvedValue({ items: [service], count: 1 }); facilitiesApi.getFacilities.mockResolvedValue({ items: [facility], count: 1 }); facilitiesApi.getFacility.mockResolvedValue(facility) })
const wrap = (node) => render(<MemoryRouter>{node}</MemoryRouter>)

test('facilities show loading, results, links, and complete filters', async () => { let resolve; facilitiesApi.getFacilities.mockReturnValue(new Promise((done) => { resolve = done })); wrap(<FacilitiesPage />); expect(screen.getByRole('status')).toHaveTextContent('Loading'); resolve({ items: [facility], count: 1 }); expect(await screen.findByText('Demo Family Clinic')).toBeInTheDocument(); for (const label of ['District', 'Facility type', 'Health service', 'Language', 'Emergency capability']) expect(screen.getByLabelText(label)).toBeInTheDocument(); expect(screen.getByRole('link', { name: facility.name })).toHaveAttribute('href', '/facilities/f1') })
test('facility filters apply and clear explicitly', async () => { wrap(<FacilitiesPage />); await screen.findByText(facility.name); fireEvent.change(screen.getByLabelText('District'), { target: { value: 'Colombo' } }); fireEvent.change(screen.getByLabelText('Health service'), { target: { value: 's1' } }); fireEvent.click(screen.getByRole('button', { name: 'Apply filters' })); await waitFor(() => expect(facilitiesApi.getFacilities).toHaveBeenLastCalledWith({ district: 'Colombo', healthService: 's1' })); fireEvent.click(screen.getByRole('button', { name: 'Clear filters' })); await waitFor(() => expect(facilitiesApi.getFacilities).toHaveBeenLastCalledWith({})) })
test('facilities render empty and API error states', async () => { facilitiesApi.getFacilities.mockResolvedValue({ items: [], count: 0 }); const view = wrap(<FacilitiesPage />); expect(await screen.findByText(/No active facilities/)).toBeInTheDocument(); view.unmount(); facilitiesApi.getFacilities.mockRejectedValue(new Error()); wrap(<FacilitiesPage />); expect(await screen.findByRole('alert')).toHaveTextContent('Unable') })
test('facility details render safe data and not-found state', async () => { const view = render(<MemoryRouter initialEntries={['/facilities/f1']}><Routes><Route path="/facilities/:id" element={<FacilityDetailsPage />} /></Routes></MemoryRouter>); expect(await screen.findByRole('heading', { name: facility.name })).toBeInTheDocument(); expect(screen.getByText(/General Medicine/)).toBeInTheDocument(); view.unmount(); facilitiesApi.getFacility.mockRejectedValue({ response: { status: 404 } }); render(<MemoryRouter initialEntries={['/facilities/missing']}><Routes><Route path="/facilities/:id" element={<FacilityDetailsPage />} /></Routes></MemoryRouter>); expect(await screen.findByRole('alert')).toHaveTextContent('not found') })
test('services page handles loading, results, empty, and errors', async () => { const view = wrap(<ServicesPage />); expect(screen.getByRole('status')).toHaveTextContent('Loading'); expect(await screen.findByText(service.name)).toBeInTheDocument(); view.unmount(); servicesApi.getHealthServices.mockResolvedValue({ items: [], count: 0 }); const empty = wrap(<ServicesPage />); expect(await screen.findByText(/No active/)).toBeInTheDocument(); empty.unmount(); servicesApi.getHealthServices.mockRejectedValue(new Error()); wrap(<ServicesPage />); expect(await screen.findByRole('alert')).toBeInTheDocument() })
test('admin service create, edit, and deactivation confirmation work', async () => { wrap(<AdminServicesPage />); await screen.findByText(/General Medicine — General/); expect(screen.getByLabelText('Name *')).toBeRequired(); fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Eye Care' } }); fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'Specialist' } }); fireEvent.click(screen.getByRole('button', { name: 'Create service' })); await waitFor(() => expect(servicesApi.createHealthService).toHaveBeenCalled()); fireEvent.click(screen.getByRole('button', { name: 'Edit' })); fireEvent.click(screen.getByRole('button', { name: 'Save changes' })); await waitFor(() => expect(servicesApi.updateHealthService).toHaveBeenCalled()); fireEvent.click(screen.getByRole('button', { name: 'Deactivate' })); expect(screen.getByRole('alertdialog')).toHaveTextContent('Deactivate this health service?') })
test('admin facility form loads services, edits, and confirms deactivation', async () => { wrap(<AdminFacilitiesPage />); expect(await screen.findByText(/Demo Family Clinic — Colombo/)).toBeInTheDocument(); expect(screen.getByLabelText('General Medicine')).toBeInTheDocument(); expect(screen.getByLabelText('Name *')).toBeRequired(); fireEvent.click(screen.getByRole('button', { name: 'Edit' })); fireEvent.click(screen.getByRole('button', { name: 'Save facility' })); await waitFor(() => expect(facilitiesApi.updateFacility).toHaveBeenCalledWith('f1', expect.objectContaining({ healthServices: ['s1'] }))); fireEvent.click(screen.getByRole('button', { name: 'Deactivate' })); expect(screen.getByRole('alertdialog')).toHaveTextContent('Deactivate this facility?') })

test('admin creates a facility with selected language and service IDs', async () => {
  facilitiesApi.getFacilities.mockResolvedValue({ items: [], count: 0 })
  wrap(<AdminFacilitiesPage />)
  await screen.findByText('No active facilities.')
  fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Test Central Hospital' } })
  fireEvent.change(screen.getByLabelText('Facility type *'), { target: { value: 'HOSPITAL' } })
  fireEvent.change(screen.getByLabelText('District *'), { target: { value: 'Colombo' } })
  fireEvent.change(screen.getByLabelText('Address *'), { target: { value: 'Test address' } })
  fireEvent.click(screen.getByLabelText('English'))
  fireEvent.click(screen.getByLabelText('General Medicine'))
  fireEvent.click(screen.getByRole('button', { name: 'Save facility' }))
  await waitFor(() => expect(facilitiesApi.createFacility).toHaveBeenCalledWith(expect.objectContaining({ supportedLanguages: ['en'], healthServices: ['s1'] })))
})
