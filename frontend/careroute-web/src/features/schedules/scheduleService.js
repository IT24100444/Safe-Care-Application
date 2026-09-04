import {apiClient} from '../../services/apiClient.js'
export const getSchedules=async(params={})=>(await apiClient.get('/schedules',{params})).data.data
export const getMySchedules=async()=>(await apiClient.get('/schedules/mine')).data.data
export const createSchedule=async body=>(await apiClient.post('/schedules',body)).data.data
export const updateSchedule=async(id,body)=>(await apiClient.patch(`/schedules/${id}`,body)).data.data
export const deactivateSchedule=async id=>(await apiClient.delete(`/schedules/${id}`)).data.data
