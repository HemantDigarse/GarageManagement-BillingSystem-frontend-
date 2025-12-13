import api from './api'
export const listServices = () => api.get('/services').then(r => r.data)
export const createService = (p) => api.post('/services', p).then(r => r.data)
export const updateService = (id, p) => api.put(`/services/${id}`, p).then(r => r.data)
export const deleteService = (id) => api.delete(`/services/${id}`).then(r => r.data)
