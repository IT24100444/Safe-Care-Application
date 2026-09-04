import {apiClient} from '../../services/apiClient.js'
export const getHealthServices=async()=>(await apiClient.get('/health-services')).data.data
export const createHealthService=async data=>(await apiClient.post('/health-services',data)).data.data
export const updateHealthService=async(id,data)=>(await apiClient.patch(`/health-services/${id}`,data)).data.data
export const deactivateHealthService=id=>apiClient.delete(`/health-services/${id}`)
