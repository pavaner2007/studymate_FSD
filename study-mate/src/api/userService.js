import api from './axios'

export const fetchProfile = () => api.get('/users/profile')
export const updateProfile = (data) => api.put('/users/profile', data)
