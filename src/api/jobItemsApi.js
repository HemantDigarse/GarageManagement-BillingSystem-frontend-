import api from './api'
export const listJobItems = () => api.get('/jobitems').then(r => r.data)
export const createJobItem = (p) => api.post('/jobitems', p).then(r => r.data)
export const updateJobItem = (id, p) => api.put(`/jobitems/${id}`, p).then(r => r.data)
export const deleteJobItem = (id) => api.delete(`/jobitems/${id}`).then(r => r.data)
