// src/pages/JobItems.jsx
import React, { useEffect, useState } from 'react';
import { listJobItems, createJobItem, updateJobItem, deleteJobItem } from '../api/jobItemsApi';

export default function JobItems() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: '', qty: 1, rate: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await listJobItems();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load job items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.name === 'qty' || e.target.name === 'rate' ? Number(e.target.value) : e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try { 
      await createJobItem(form); 
      setForm({ description: '', qty: 1, rate: 0 }); 
      setSuccess('✅ Job item created successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError('❌ Create failed'); }
  };

  const startEdit = (i) => { setEditing(i.id); setForm({ description: i.description || '', qty: i.qty || 1, rate: i.rate || 0 }); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try { 
      await updateJobItem(editing, form); 
      setEditing(null); 
      setForm({ description: '', qty: 1, rate: 0 }); 
      setSuccess('✅ Job item updated successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError('❌ Update failed'); }
  };

  const remove = async (id) => { 
    if (!window.confirm('🗑️ Are you sure you want to delete this job item?')) return; 
    try { 
      await deleteJobItem(id); 
      setSuccess('✅ Job item deleted successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('❌ Delete failed'); } 
  };

  const filteredList = list.filter(i =>
    i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <span>📄</span> Job Items Management
        </h1>
        <p className="text-slate-300">Manage work order line items</p>
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
          {editing ? 'Edit Job Item' : 'Add New Job Item'}
        </h2>
        <form onSubmit={editing ? save : create} className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <input 
            name="description" 
            value={form.description} 
            onChange={change} 
            placeholder="📝 Description" 
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
          />
          <input 
            name="qty" 
            type="number" 
            value={form.qty} 
            onChange={change} 
            placeholder="🔢 Quantity" 
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
          />
          <input 
            name="rate" 
            type="number" 
            step="0.01"
            value={form.rate} 
            onChange={change} 
            placeholder="💰 Rate" 
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
          />
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {editing ? '💾 Save' : '➕ Create'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); setForm({ description: '', qty: 1, rate: 0 }); }} 
                className="px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
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
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="🔍 Search job items..."
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Job Items Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">⚙️</div>
              <div className="text-xl text-white">Loading job items...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-white font-bold">📝 Description</th>
                  <th className="p-4 text-left text-white font-bold">🔢 Qty</th>
                  <th className="p-4 text-left text-white font-bold">💰 Rate</th>
                  <th className="p-4 text-left text-white font-bold">💵 Total</th>
                  <th className="p-4 text-left text-white font-bold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredList.map(i => (
                  <tr key={i.id || i._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-white font-medium">{i.description}</td>
                    <td className="p-4 text-slate-300">{i.qty}</td>
                    <td className="p-4 text-green-300">${i.rate}</td>
                    <td className="p-4 text-green-400 font-bold">${(i.qty * i.rate).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEdit(i)} 
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => remove(i.id || i._id)} 
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      <div className="text-6xl mb-4">📭</div>
                      <div className="text-xl">
                        {searchTerm ? 'No job items found matching your search' : 'No job items yet'}
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
          <span>📊 Total Items: <strong className="text-white">{list.length}</strong></span>
          <span>🔍 Showing: <strong className="text-white">{filteredList.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
