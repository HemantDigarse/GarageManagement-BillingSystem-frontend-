import api from './api'
export const listInvoices = () => api.get('/invoices').then(r => r.data)
export const createInvoice = (p) => api.post('/invoices', p).then(r => r.data)
export const updateInvoice = (id, p) => api.put(`/invoices/${id}`, p).then(r => r.data)
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`).then(r => r.data)
