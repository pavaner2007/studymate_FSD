import api from './axios'

export const fetchChats = () => api.get('/chat')
export const fetchChatById = (id) => api.get(`/chat/${id}`)
export const createChat = () => api.post('/chat')
export const deleteChat = (id) => api.delete(`/chat/${id}`)
export const sendMessage = (id, content) => api.post(`/chat/${id}/message`, { content })
export const uploadPdfToChat = (id, formData) =>
  api.post(`/chat/${id}/upload-pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const removePdfFromChat = (id) => api.delete(`/chat/${id}/pdf`)
export const scrapeWebPage = (id, url) => api.post(`/chat/${id}/scrape`, { url })
export const removeWebFromChat = (id) => api.delete(`/chat/${id}/web`)
export const summarizeYoutube = (id, url) => api.post(`/chat/${id}/youtube`, { url })
export const removeYoutubeFromChat = (id) => api.delete(`/chat/${id}/youtube`)
