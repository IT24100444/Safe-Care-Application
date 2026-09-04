import {apiClient} from '../../services/apiClient.js'
export const getDoctors=async(params={})=>(await apiClient.get('/doctors',{params})).data.data
export const getDoctor=async id=>(await apiClient.get(`/doctors/${id}`)).data.data
export const getMyDoctorProfile=async()=>(await apiClient.get('/doctors/me')).data.data
export const getAvailability=async(id,date)=>(await apiClient.get(`/doctors/${id}/availability`,{params:{date}})).data.data
export const createDoctor=async body=>(await apiClient.post('/doctors',body)).data.data
export const updateDoctor=async(id,body)=>(await apiClient.patch(`/doctors/${id}`,body)).data.data
export const deactivateDoctor=async id=>(await apiClient.delete(`/doctors/${id}`)).data.data
