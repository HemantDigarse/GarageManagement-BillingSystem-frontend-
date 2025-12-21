// src/pages/Invoices.jsx
import React, { useEffect, useState } from 'react';
import { listInvoices, createInvoice, updateInvoice, deleteInvoice } from '../api/invoicesApi';
import { listCustomers } from '../api/customersApi';
import { listVehicles } from '../api/vehiclesApi';
import { listServices } from '../api/servicesApi';
import { createPayment } from '../api/paymentsApi';

export default function Invoices() {
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [form, setForm] = useState({ customerId: '', vehicleId: '', status: 'pending' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const [invoiceData, customerData, vehicleData, serviceData] = await Promise.all([
        listInvoices(),
        listCustomers(),
        listVehicles(),
        listServices()
      ]);
      setList(Array.isArray(invoiceData) ? invoiceData : []);
      setCustomers(Array.isArray(customerData) ? customerData : []);
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addService = (serviceId) => {
    if (!serviceId || selectedServices.some(s => s.id === serviceId)) return;
    const service = services.find(s => (s.id || s._id) == serviceId);
    if (service) {
      setSelectedServices([...selectedServices, { 
        id: service.id || service._id, 
        name: service.name, 
        price: service.price 
      }]);
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.customerId || !form.vehicleId || selectedServices.length === 0) {
      setError(' Please select customer, vehicle, and at least one service');
      return;
    }

    try { 
      const servicesString = selectedServices.map(s => s.name).join(', ');
      const totalAmount = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
      const invoiceDate = new Date().toISOString().split('T')[0];
      
      const invoiceData = {
        customerId: form.customerId,
        vehicleId: form.vehicleId,
        services: servicesString,
        status: form.status,
        totalAmount: totalAmount,
        invoiceDate: invoiceDate
      };
      await createInvoice(invoiceData); 
      setForm({ customerId: '', vehicleId: '', status: 'pending' }); 
      setSelectedServices([]);
      setSuccess(' Invoice created successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError(' Create failed'); }
  };

  const startEdit = (invoice) => { 
    setEditing(invoice.id || invoice._id); 
    setForm({ 
      customerId: invoice.customerId || '', 
      vehicleId: invoice.vehicleId || '', 
      status: invoice.status || 'pending' 
    }); 
    // Load services for this invoice if available
    if (invoice.services && typeof invoice.services === 'string') {
      // Parse comma-separated string back to array
      const serviceNames = invoice.services.split(',').map(s => s.trim());
      const invoiceServices = serviceNames.map(name => {
        const service = services.find(s => s.name === name);
        return service ? { id: service.id || service._id, name: service.name, price: service.price } : null;
      }).filter(Boolean);
      setSelectedServices(invoiceServices);
    } else {
      setSelectedServices([]);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.customerId || !form.vehicleId || selectedServices.length === 0) {
      setError(' Please select customer, vehicle, and at least one service');
      return;
    }

    try { 
      const servicesString = selectedServices.map(s => s.name).join(', ');
      const totalAmount = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
      const invoiceDate = new Date().toISOString().split('T')[0];
      
      const invoiceData = {
        customerId: form.customerId,
        vehicleId: form.vehicleId,
        services: servicesString,
        status: form.status,
        totalAmount: totalAmount,
        invoiceDate: invoiceDate
      };
      await updateInvoice(editing, invoiceData); 
      setEditing(null); 
      setForm({ customerId: '', vehicleId: '', status: 'pending' }); 
      setSelectedServices([]);
      setSuccess(' Invoice updated successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError(' Update failed'); }
  };

  const remove = async (id) => { 
    if (!window.confirm(' Are you sure you want to delete this invoice?')) return; 
    try { 
      await deleteInvoice(id); 
      setSuccess(' Invoice deleted successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError(' Delete failed'); } 
  };

  const startPayment = (invoice) => {
    setPayingInvoice(invoice);
    setPaymentMethod('cash');
  };

  const processPayment = async () => {
    if (!payingInvoice) return;
    setError('');
    setSuccess('');

    try {
      const paymentDate = new Date().toISOString().split('T')[0];
      const paymentData = {
        invoiceId: payingInvoice.id || payingInvoice._id,
        amount: payingInvoice.totalAmount,
        method: paymentMethod,
        paymentDate: paymentDate
      };
      
      await createPayment(paymentData);
      await updateInvoice(payingInvoice.id || payingInvoice._id, { status: 'completed' });
      
      setPayingInvoice(null);
      setSuccess(' Payment recorded and invoice marked as completed!');
      await fetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Payment failed');
    }
  };

  const filteredList = list.filter(inv => {
    const customer = customers.find(c => (c.id || c._id) == inv.customerId);
    const vehicle = vehicles.find(v => (v.id || v._id) == inv.vehicleId);
    const searchLower = searchTerm.toLowerCase();
    return (
      customer?.name?.toLowerCase().includes(searchLower) ||
      vehicle?.plateNumber?.toLowerCase().includes(searchLower) ||
      inv.invoiceId?.toLowerCase().includes(searchLower) ||
      (inv.id || inv._id)?.toString().includes(searchLower)
    );
  });

  const filteredVehicles = vehicles.filter(v => !form.customerId || v.customerId == form.customerId);

  const totalServices = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <span></span> Payment Management
        </h1>
        <p className="text-slate-300">Create invoices and process payments in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Total Invoices</div>
          <div className="text-3xl font-bold text-white">{list.length}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Pending Payment</div>
          <div className="text-3xl font-bold text-white">{list.filter(i => i.status === 'pending').length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Paid</div>
          <div className="text-3xl font-bold text-white">{list.filter(i => i.status === 'completed').length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Total Revenue</div>
          <div className="text-3xl font-bold text-white">₹{list.filter(i => i.status === 'completed').reduce((sum, i) => sum + (i.totalAmount || 0), 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 animate-pulse">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>{editing ? '✏️' : '➕'}</span>
          {editing ? 'Edit Invoice' : 'Create New Invoice'}
        </h2>
        <form onSubmit={editing ? save : create} className="space-y-4">
          {/* Customer and Vehicle Selection */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <select 
              name="customerId" 
              value={form.customerId} 
              onChange={change} 
              required
              className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
            >
              <option value="">👤 Select Customer</option>
              {customers.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select 
              name="vehicleId" 
              value={form.vehicleId} 
              onChange={change} 
              required
              disabled={!form.customerId}
              className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium disabled:opacity-50"
            >
              <option value="">🚗 Select Vehicle</option>
              {filteredVehicles.map(v => (
                <option key={v.id || v._id} value={v.id || v._id}>
                  {v.plateNumber} - {v.brand} {v.model}
                </option>
              ))}
            </select>

            <select 
              name="status" 
              value={form.status} 
              onChange={change} 
              className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
            >
              <option value="pending">🟡 Pending</option>
              <option value="completed">🟢 Completed</option>
              <option value="cancelled">🔴 Cancelled</option>
            </select>
          </div>

          {/* Service Selection */}
          <div className="border-2 border-slate-600 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">🛒 Add Services</h3>
            <div className="flex gap-2 mb-4">
              <select 
                id="serviceSelect"
                className="flex-1 p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
              >
                <option value="">🔧 Select a service to add...</option>
                {services.filter(s => !selectedServices.some(sel => sel.id === (s.id || s._id))).map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name} - ₹{Number(s.price).toFixed(2)}
                  </option>
                ))}
              </select>
              <button 
                type="button"
                onClick={() => {
                  const select = document.getElementById('serviceSelect');
                  addService(select.value);
                  select.value = '';
                }}
                className="px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                ➕ Add
              </button>
            </div>

            {/* Selected Services List */}
            {selectedServices.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-300 mb-2">Selected Services:</h4>
                {selectedServices.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="text-white font-medium">{s.name}</span>
                      <span className="text-green-300 font-bold ml-3">₹{Number(s.price).toFixed(2)}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeService(s.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <div className="bg-green-500/20 border-2 border-green-500 p-3 rounded-lg mt-3">
                  <div className="text-green-300 font-bold text-lg">
                    💰 Total: ₹{totalServices.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-4">
                No services added yet
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {editing ? '💾 Save Changes' : '➕ Create Invoice'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { 
                  setEditing(null); 
                  setForm({ customerId: '', vehicleId: '', status: 'pending' }); 
                  setSelectedServices([]);
                }} 
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-600">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="🔍 Search by customer, vehicle, or invoice ID..."
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">⚙️</div>
              <div className="text-xl text-white">Loading invoices...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-white font-bold">📅 Date</th>
                  <th className="p-4 text-left text-white font-bold">👤 Customer</th>
                  <th className="p-4 text-left text-white font-bold">🚗 Vehicle</th>
                  <th className="p-4 text-left text-white font-bold">🔧 Services</th>
                  <th className="p-4 text-left text-white font-bold">� Amount</th>
                  <th className="p-4 text-left text-white font-bold">�📊 Status</th>
                  <th className="p-4 text-left text-white font-bold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredList.map(inv => {
                  const customer = customers.find(c => (c.id || c._id) == inv.customerId);
                  const vehicle = vehicles.find(v => (v.id || v._id) == inv.vehicleId);

                  return (
                    <tr key={inv.id || inv._id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 text-white font-medium">{inv.invoiceDate || 'N/A'}</td>
                      <td className="p-4 text-slate-300">{customer?.name || 'N/A'}</td>
                      <td className="p-4 text-slate-300">{vehicle?.plateNumber || 'N/A'}</td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {inv.services || <span className="text-slate-400">No services</span>}
                        </div>
                      </td>
                      <td className="p-4 text-green-300 font-bold text-lg">₹{Number(inv.totalAmount || 0).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          inv.status === 'completed' ? 'bg-green-500/20 text-green-300' : 
                          inv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {inv.status === 'completed' ? '🟢 Paid' : 
                           inv.status === 'pending' ? '🟡 Unpaid' : 
                           '🔴 Cancelled'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {inv.status === 'pending' && (
                            <button 
                              onClick={() => startPayment(inv)} 
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                            >
                              💳 Pay
                            </button>
                          )}
                          <button 
                            onClick={() => startEdit(inv)} 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => remove(inv.id || inv._id)} 
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      <div className="text-6xl mb-4">📭</div>
                      <div className="text-xl">
                        {searchTerm ? 'No invoices found matching your search' : 'No invoices yet'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border-2 border-purple-500 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💳</span> Process Payment
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <div className="text-slate-400 text-sm">Customer</div>
                <div className="text-white font-bold text-lg">{customers.find(c => (c.id || c._id) == payingInvoice.customerId)?.name || 'N/A'}</div>
              </div>
              
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <div className="text-slate-400 text-sm">Vehicle</div>
                <div className="text-white font-medium">{vehicles.find(v => (v.id || v._id) == payingInvoice.vehicleId)?.plateNumber || 'N/A'}</div>
              </div>
              
              <div className="bg-green-500/20 border-2 border-green-500 p-4 rounded-lg">
                <div className="text-green-300 text-sm">Payment Amount</div>
                <div className="text-green-300 font-bold text-3xl">₹{Number(payingInvoice.totalAmount || 0).toFixed(2)}</div>
              </div>
              
              <div>
                <label className="block text-slate-300 font-medium mb-2">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="card">💳 Card</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  <option value="upi">📱 UPI</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={processPayment}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                ✅ Confirm Payment
              </button>
              <button 
                onClick={() => setPayingInvoice(null)}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-500 transition-colors"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-600">
        <div className="flex items-center justify-between text-slate-300">
          <span>📊 Total Invoices: <strong className="text-white">{list.length}</strong></span>
          <span>🔍 Showing: <strong className="text-white">{filteredList.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
