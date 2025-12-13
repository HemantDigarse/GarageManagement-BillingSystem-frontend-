// src/pages/JobCards.jsx
import React, { useEffect, useState } from 'react';
import { listJobCards, createJobCard, updateJobCard, deleteJobCard } from '../api/jobCardsApi';
import { listServices } from '../api/servicesApi';
import { listVehicles } from '../api/vehiclesApi';
import { listCustomers } from '../api/customersApi';

export default function JobCards() {
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    customerId: '', 
    vehicleId: '', 
    serviceId: '',
    createdDate: new Date().toISOString().split('T')[0],
    status: 'PENDING'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await listJobCards();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load job cards');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await listCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await listVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    }
  };

  const loadServices = async () => {
    try {
      const data = await listServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };

  useEffect(() => { 
    fetch(); 
    loadCustomers();
    loadVehicles();
    loadServices();
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.vehicleId || !form.serviceId) {
      setError('Customer, Vehicle, and Service are required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Get service price for estimatedCost
    const selectedService = services.find(s => (s.id || s._id) == form.serviceId);
    const jobCardData = {
      ...form,
      estimatedCost: selectedService?.price || 0
    };
    
    try {
      await createJobCard(jobCardData);
      setForm({ 
        customerId: '', 
        vehicleId: '', 
        serviceId: '',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      });
      setSuccess('✅ Job card created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetch();
    } catch {
      setError('❌ Create failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (j) => {
    setEditing(j.id || j._id);
    setForm({ 
      customerId: j.customerId || '', 
      vehicleId: j.vehicleId || '', 
      serviceId: j.serviceId || '',
      createdDate: j.createdDate || new Date().toISOString().split('T')[0],
      status: j.status || 'PENDING'
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.vehicleId || !form.serviceId) {
      setError('Customer, Vehicle, and Service are required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Get service price for estimatedCost
    const selectedService = services.find(s => (s.id || s._id) == form.serviceId);
    const jobCardData = {
      ...form,
      estimatedCost: selectedService?.price || 0
    };
    
    try {
      await updateJobCard(editing, jobCardData);
      setEditing(null);
      setForm({ 
        customerId: '', 
        vehicleId: '', 
        serviceId: '',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      });
      setSuccess('✅ Job card updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetch();
    } catch {
      setError('❌ Update failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this job card?')) return;
    try {
      await deleteJobCard(id);
      setSuccess('✅ Job card deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetch();
    } catch {
      setError('❌ Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredList = list.filter(j => {
    const service = services.find(s => (s.id || s._id) == j.serviceId);
    return (
      (j.customerId?.toString() || '').includes(searchTerm.toLowerCase()) ||
      (j.vehicleId?.toString() || '').includes(searchTerm.toLowerCase()) ||
      (service?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (j.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">🟡 Pending</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">🔵 In Progress</span>;
      case 'COMPLETED': return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">🟢 Completed</span>;
      case 'CANCELLED': return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">🔴 Cancelled</span>;
      default: return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">{status}</span>;
    }
  };

  const pendingCount = list.filter(j => j.status?.toUpperCase() === 'PENDING').length;
  const inProgressCount = list.filter(j => j.status?.toUpperCase() === 'IN_PROGRESS').length;
  const completedCount = list.filter(j => j.status?.toUpperCase() === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <span>📋</span> Job Cards Management
        </h1>
        <p className="text-slate-300">Track and manage work orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-1">Pending</p>
              <p className="text-white text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="text-5xl">🟡</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">In Progress</p>
              <p className="text-white text-3xl font-bold">{inProgressCount}</p>
            </div>
            <div className="text-5xl">🔵</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
              <p className="text-white text-3xl font-bold">{completedCount}</p>
            </div>
            <div className="text-5xl">🟢</div>
          </div>
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

      {/* Form */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>{editing ? '✏️' : '➕'}</span>
          {editing ? 'Edit Job Card' : 'Add New Job Card'}
        </h2>
        <form onSubmit={editing ? save : create} className="grid gap-4 grid-cols-1 md:grid-cols-5">
          <select
            name="customerId"
            value={form.customerId}
            onChange={change}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="">👤 Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id || customer._id} value={customer.id || customer._id}>
                ID: {customer.id || customer._id} - {customer.name}
              </option>
            ))}
          </select>
          <select
            name="vehicleId"
            value={form.vehicleId}
            onChange={change}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="">🚗 Select Vehicle</option>
            {vehicles
              .filter(v => !form.customerId || v.customerId == form.customerId)
              .map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  ID: {vehicle.id} - {vehicle.plateNumber} ({vehicle.brand} {vehicle.model})
                </option>
              ))}
          </select>
          <select
            name="serviceId"
            value={form.serviceId}
            onChange={change}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="">🔧 Select Service</option>
            {services.map((service) => (
              <option key={service.id || service._id} value={service.id || service._id}>
                {service.name} - ${Number(service.price || 0).toFixed(2)}
              </option>
            ))}
          </select>
          <input
            name="createdDate"
            value={form.createdDate}
            onChange={change}
            type="date"
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <select
            name="status"
            value={form.status}
            onChange={change}
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="PENDING">🟡 Pending</option>
            <option value="IN_PROGRESS">🔵 In Progress</option>
            <option value="COMPLETED">🟢 Completed</option>
            <option value="CANCELLED">🔴 Cancelled</option>
          </select>

          <div className="md:col-span-5 flex items-center gap-4">
            {form.serviceId && (
              <div className="flex-1 p-3 bg-green-100 border-2 border-green-500 rounded-lg">
                <span className="text-green-800 font-bold">
                  💰 Estimated Cost: $
                  {Number(services.find(s => (s.id || s._id) == form.serviceId)?.price || 0).toFixed(2)}
                </span>
              </div>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {editing ? '💾 Save' : '➕ Create'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ 
                    customerId: '', 
                    vehicleId: '', 
                    serviceId: '',
                    createdDate: new Date().toISOString().split('T')[0],
                    status: 'PENDING'
                  });
                }}
                className="px-8 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                ❌
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-600">
        <input
          type="text"
          placeholder="🔍 Search by customer, vehicle, service, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">⚙️</div>
              <div className="text-xl text-white">Loading job cards...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-white font-bold">👤 Customer</th>
                  <th className="p-4 text-left text-white font-bold">🚗 Vehicle</th>
                  <th className="p-4 text-left text-white font-bold">🔧 Service</th>
                  <th className="p-4 text-left text-white font-bold">📅 Date</th>
                  <th className="p-4 text-left text-white font-bold">💰 Cost</th>
                  <th className="p-4 text-left text-white font-bold">📊 Status</th>
                  <th className="p-4 text-left text-white font-bold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredList.map((j) => {
                  const customer = customers.find(c => (c.id || c._id) == j.customerId);
                  const vehicle = vehicles.find(v => v.id == j.vehicleId);
                  const service = services.find(s => (s.id || s._id) == j.serviceId);
                  
                  return (
                    <tr key={j.id || j._id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 text-slate-300">{customer?.name || j.customerId}</td>
                      <td className="p-4 text-slate-300">{vehicle?.plateNumber || j.vehicleId}</td>
                      <td className="p-4 text-white font-medium">{service?.name || 'N/A'}</td>
                      <td className="p-4 text-slate-300">{j.createdDate}</td>
                      <td className="p-4 text-green-300 font-bold">${Number(j.estimatedCost || service?.price || 0).toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(j.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(j)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => remove(j.id || j._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      <div className="text-6xl mb-4">📋</div>
                      <div className="text-xl">
                        {searchTerm ? 'No job cards found matching your search' : 'No job cards yet'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-600">
        <div className="flex items-center justify-between text-slate-300">
          <span>📊 Total Job Cards: <strong className="text-white">{list.length}</strong></span>
          <span>🟡 {pendingCount} Pending · 🔵 {inProgressCount} In Progress · 🟢 {completedCount} Completed</span>
        </div>
      </div>
    </div>
  );
}
