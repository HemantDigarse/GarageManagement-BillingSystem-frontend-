import api from './api'
export const listJobCards = () => api.get('/jobcards').then(r => r.data)
export const createJobCard = (p) => api.post('/jobcards', p).then(r => r.data)
export const updateJobCard = (id, p) => api.put(`/jobcards/${id}`, p).then(r => r.data)
export const deleteJobCard = (id) => api.delete(`/jobcards/${id}`).then(r => r.data)
