import {apiClient} from '../../services/apiClient.js'
export const getFacilities=async params=>(await apiClient.get('/facilities',{params})).data.data
export const getFacility=async id=>(await apiClient.get(`/facilities/${id}`)).data.data
export const createFacility=async data=>(await apiClient.post('/facilities',data)).data.data
export const updateFacility=async(id,data)=>(await apiClient.patch(`/facilities/${id}`,data)).data.data
export const deactivateFacility=id=>apiClient.delete(`/facilities/${id}`)
