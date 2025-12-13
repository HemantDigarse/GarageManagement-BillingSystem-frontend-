import api from './api'
export const listPayments = () => api.get('/payments').then(r => r.data)
export const createPayment = (p) => api.post('/payments', p).then(r => r.data)
export const updatePayment = (id, p) => api.put(`/payments/${id}`, p).then(r => r.data)
export const deletePayment = (id) => api.delete(`/payments/${id}`).then(r => r.data)
