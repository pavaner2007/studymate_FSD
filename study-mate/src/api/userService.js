import api from './axios'

export const fetchProfile = () => api.get('/users/profile')
export const updateProfile = (data) => api.put('/users/profile', data)
export const toggleBookmark = (noteId) => api.post(`/users/bookmarks/${noteId}`)
export const fetchBookmarks = () => api.get('/users/bookmarks')
