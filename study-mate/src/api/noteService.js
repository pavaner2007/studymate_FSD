import api from './axios'

export const fetchNotes = (params) => api.get('/notes', { params })
export const fetchNoteById = (id) => api.get(`/notes/${id}`)
export const fetchStats = () => api.get('/notes/stats')
export const uploadNote = (formData) =>
  api.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const downloadNote = (id) =>
  api.get(`/notes/${id}/download`, { responseType: 'blob' })
export const deleteNote = (id) => api.delete(`/notes/${id}`)
