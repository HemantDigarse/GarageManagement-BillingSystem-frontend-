import api from './api'
export const listCustomers = () => api.get('/customers').then(r => r.data)
export const createCustomer = (payload) => api.post('/customers', payload).then(r => r.data)
export const updateCustomer = (id, payload) => api.put(`/customers/${id}`, payload).then(r => r.data)
export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then(r => r.data)
