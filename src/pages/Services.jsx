// src/pages/Services.jsx
import React, { useEffect, useState } from 'react';
import { listServices, createService, updateService, deleteService } from '../api/servicesApi';

export default function Services() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await listServices();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try { 
      await createService(form); 
      setForm({ name: '', description: '', price: '' }); 
      setSuccess(' Service created successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError(' Create failed'); }
  };

  const startEdit = (s) => { setEditing(s.id); setForm({ name: s.name || '', description: s.description || '', price: s.price || '' }); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try { 
      await updateService(editing, form); 
      setEditing(null); 
      setForm({ name: '', description: '', price: '' }); 
      setSuccess(' Service updated successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError(' Update failed'); }
  };

  const remove = async (id) => { 
    if (!window.confirm(' Are you sure you want to delete this service?')) return; 
    try { 
      await deleteService(id); 
      setSuccess(' Service deleted successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError(' Delete failed'); } 
  };

  const filteredList = list.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <span></span> Services Management
        </h1>
        <p className="text-slate-300">Manage your service offerings</p>
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
          <span>{editing ? '' : ''}</span>
          {editing ? 'Edit Service' : 'Add New Service'}
        </h2>
        <form onSubmit={editing ? save : create} className="grid gap-4 grid-cols-1 md:grid-cols-6">
          <input 
            name="name" 
            value={form.name} 
            onChange={change} 
            placeholder=" Service Name" 
            required
            className="md:col-span-2 p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
          />
          <input 
            name="description" 
            value={form.description} 
            onChange={change} 
            placeholder=" Description" 
            required
            className="md:col-span-2 p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
          />
          <input 
            name="price" 
            value={form.price} 
            onChange={change} 
            placeholder="Price" 
            type="number"
            step="0.01"
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
          />
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {editing ? ' Save' : ' Create'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '' }); }} 
                className="px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                
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
          placeholder="Search services..."
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Services Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4"></div>
              <div className="text-xl text-white">Loading services...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-white font-bold"> Service Name</th>
                  <th className="p-4 text-left text-white font-bold"> Description</th>
                  <th className="p-4 text-left text-white font-bold"> Price</th>
                  <th className="p-4 text-left text-white font-bold"> Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredList.map(s => (
                  <tr key={s.id || s._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-white font-medium">{s.name}</td>
                    <td className="p-4 text-slate-300">{s.description}</td>
                    <td className="p-4 text-green-300 font-bold">₹{Number(s.price).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEdit(s)} 
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                           Edit
                        </button>
                        <button 
                          onClick={() => remove(s.id || s._id)} 
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                           Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">
                      <div className="text-6xl mb-4"></div>
                      <div className="text-xl">
                        {searchTerm ? 'No services found matching your search' : 'No services yet'}
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
          <span> Total Services: <strong className="text-white">{list.length}</strong></span>
          <span> Showing: <strong className="text-white">{filteredList.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
