// src/pages/Customers.jsx
import React, { useEffect, useState } from 'react';
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../api/customersApi';

export default function Customers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await listCustomers();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createCustomer(form);
      setForm({ name: '', email: '', phone: '' });
      setSuccess(' Customer created successfully!');
      await fetchList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(' Create failed');
    }
  };

  const startEdit = (c) => {
    setEditing(c.id);
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateCustomer(editing, form);
      setEditing(null);
      setForm({ name: '', email: '', phone: '' });
      setSuccess(' Customer updated successfully!');
      await fetchList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(' Are you sure you want to delete this customer?')) return;

    try {
      await deleteCustomer(id);
      setSuccess(' Customer deleted successfully!');
      await fetchList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(' Delete failed');
    }
  };

  const filteredList = list.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          Customers Management
        </h1>
        <p className="text-slate-300">Manage your customer database</p>
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
          {editing ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <form
          onSubmit={editing ? handleUpdate : handleCreate}
          className="grid gap-4 grid-cols-1 md:grid-cols-4"
        >
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder=" Full Name"
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder=" Email Address"
            type="email"
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder=" Phone Number"
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
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
                onClick={() => {
                  setEditing(null);
                  setForm({ name: '', email: '', phone: '' });
                }}
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
          placeholder="Search customers by name, email, or phone..."
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4"></div>
              <div className="text-xl text-white">Loading customers...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>

                  <th className="p-4 text-left text-white font-bold"> Name</th>
                  <th className="p-4 text-left text-white font-bold">Email</th>
                  <th className="p-4 text-left text-white font-bold">Phone</th>
                  <th className="p-4 text-left text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredList.map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-white font-medium">{c.name}</td>
                    <td className="p-4 text-slate-300">{c.email}</td>
                    <td className="p-4 text-slate-300">{c.phone}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                         Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id || c._id)}
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
                    <td
                      colSpan="5"
                      className="p-8 text-center text-slate-400"
                    >
                      <div className="text-6xl mb-4"></div>
                      <div className="text-xl">
                        {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
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
          <span>Total Customers: <strong className="text-white">{list.length}</strong></span>
          <span> Showing: <strong className="text-white">{filteredList.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
