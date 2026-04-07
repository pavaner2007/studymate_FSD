import api from './axios'

export const fetchChats = () => api.get('/chat')
export const fetchChatById = (id) => api.get(`/chat/${id}`)
export const createChat = () => api.post('/chat')
export const deleteChat = (id) => api.delete(`/chat/${id}`)
export const sendMessage = (id, content) => api.post(`/chat/${id}/message`, { content })
export const uploadPdfToChat = (id, formData) =>
  api.post(`/chat/${id}/upload-pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const removePdfFromChat = (id) => api.delete(`/chat/${id}/pdf`)
