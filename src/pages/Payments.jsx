// src/pages/Payments.jsx
import React, { useEffect, useState } from 'react';
import { listPayments, createPayment, updatePayment, deletePayment } from '../api/paymentsApi';
import { listInvoices, updateInvoice } from '../api/invoicesApi';
import { listCustomers } from '../api/customersApi';
import { listVehicles } from '../api/vehiclesApi';

export default function Payments() {
  const [list, setList] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ invoiceId: '', amount: 0, method: 'cash' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const [paymentData, invoiceData, customerData, vehicleData] = await Promise.all([
        listPayments(),
        listInvoices(),
        listCustomers(),
        listVehicles()
      ]);
      setList(Array.isArray(paymentData) ? paymentData : []);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setCustomers(Array.isArray(customerData) ? customerData : []);
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const change = (e) => {
    const { name, value } = e.target;
    if (name === 'invoiceId') {
      const selectedInvoice = invoices.find(inv => (inv.id || inv._id) == value);
      setForm({ 
        ...form, 
        invoiceId: value,
        amount: selectedInvoice?.totalAmount || 0
      });
    } else {
      setForm({ ...form, [name]: name === 'amount' ? Number(value) : value });
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.invoiceId || !form.method) {
      setError('❌ Please select invoice and payment method');
      return;
    }

    try { 
      const paymentDate = new Date().toISOString().split('T')[0];
      const paymentData = {
        invoiceId: form.invoiceId,
        amount: form.amount,
        method: form.method,
        paymentDate: paymentDate
      };
      
      await createPayment(paymentData);
      
      // Mark invoice as completed
      await updateInvoice(form.invoiceId, { status: 'completed' });
      
      setForm({ invoiceId: '', amount: 0, method: 'cash' }); 
      setSuccess('✅ Payment recorded and invoice marked as completed!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError('❌ Payment failed'); }
  };

  const startEdit = (p) => { setEditing(p.id); setForm({ invoiceId: p.invoiceId || '', amount: p.amount || 0, method: p.method || 'cash' }); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try { 
      const paymentDate = new Date().toISOString().split('T')[0];
      const paymentData = {
        invoiceId: form.invoiceId,
        amount: form.amount,
        method: form.method,
        paymentDate: paymentDate
      };
      await updatePayment(editing, paymentData); 
      setEditing(null); 
      setForm({ invoiceId: '', amount: 0, method: 'cash' }); 
      setSuccess('✅ Payment updated successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    }
    catch { setError('❌ Update failed'); }
  };

  const remove = async (id) => { 
    if (!window.confirm('🗑️ Are you sure you want to delete this payment?')) return; 
    try { 
      await deletePayment(id); 
      setSuccess('✅ Payment deleted successfully!');
      await fetch(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('❌ Delete failed'); } 
  };

  const filteredList = list.filter(p => {
    const invoice = invoices.find(inv => (inv.id || inv._id) == p.invoiceId);
    const customer = customers.find(c => (c.id || c._id) == invoice?.customerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      p.invoiceId?.toString().includes(searchLower) ||
      p.method?.toLowerCase().includes(searchLower) ||
      customer?.name?.toLowerCase().includes(searchLower)
    );
  });

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'completed' && inv.status !== 'cancelled');

  const totalPayments = filteredList.reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashPayments = filteredList.filter(p => p.method?.toLowerCase() === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0);
  const cardPayments = filteredList.filter(p => p.method?.toLowerCase() === 'card').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <span>💳</span> Payments Management
        </h1>
        <p className="text-slate-300">Track and manage payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Total Payments</div>
          <div className="text-3xl font-bold text-white">₹{totalPayments.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Cash Payments</div>
          <div className="text-3xl font-bold text-white">₹{cashPayments.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-xl">
          <div className="text-white/80 text-sm">Card Payments</div>
          <div className="text-3xl font-bold text-white">₹{cardPayments.toFixed(2)}</div>
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

      {/* Unpaid Invoices Section */}
      {unpaidInvoices.length > 0 && !editing && (
        <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-xl p-4">
          <h3 className="text-lg font-bold text-yellow-300 mb-3">⚠️ Unpaid Invoices ({unpaidInvoices.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unpaidInvoices.slice(0, 6).map(inv => {
              const customer = customers.find(c => (c.id || c._id) == inv.customerId);
              const vehicle = vehicles.find(v => (v.id || v._id) == inv.vehicleId);
              return (
                <div key={inv.id || inv._id} className="bg-slate-800/90 p-3 rounded-lg border border-slate-600">
                  <div className="text-yellow-400 font-bold text-sm mb-1">Invoice #{inv.invoiceId || inv.id || inv._id}</div>
                  <div className="text-slate-300 text-xs mb-1">👤 {customer?.name || inv.customerId}</div>
                  <div className="text-slate-300 text-xs mb-2">🚗 {vehicle?.plateNumber || inv.vehicleId}</div>
                  <div className="text-green-300 font-bold mb-2">₹{Number(inv.totalAmount || 0).toFixed(2)}</div>
                  <button
                    type="button"
                    onClick={() => setForm({ invoiceId: inv.id || inv._id, amount: inv.totalAmount || 0, method: 'cash' })}
                    className="w-full px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded text-sm font-medium hover:scale-105 transition-transform"
                  >
                    💳 Pay Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>{editing ? '✏️' : '💳'}</span>
          {editing ? 'Edit Payment' : 'Record Payment'}
        </h2>
        <form onSubmit={editing ? save : create} className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <select 
              name="invoiceId" 
              value={form.invoiceId} 
              onChange={change} 
              required
              className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
            >
              <option value="">📋 Select Invoice</option>
              {unpaidInvoices.map(inv => {
                const customer = customers.find(c => (c.id || c._id) == inv.customerId);
                return (
                  <option key={inv.id || inv._id} value={inv.id || inv._id}>
                    #{inv.invoiceId || inv.id || inv._id} - {customer?.name} - ₹{Number(inv.totalAmount || 0).toFixed(2)}
                  </option>
                );
              })}
            </select>

            <input 
              name="amount" 
              value={form.amount} 
              onChange={change} 
              type="number" 
              step="0.01"
              placeholder="💵 Amount" 
              required
              className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium" 
            />

            <select 
              name="method" 
              value={form.method} 
              onChange={change} 
              required
              className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
            >
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Card</option>
              <option value="bank">🏦 Bank Transfer</option>
              <option value="upi">📱 UPI</option>
            </select>
          </div>

          {form.invoiceId && (
            <div className="bg-green-500/20 border-2 border-green-500 p-4 rounded-lg">
              <div className="text-green-300 font-bold text-lg">
                💰 Payment Amount: ₹{Number(form.amount).toFixed(2)}
              </div>
              <div className="text-slate-300 text-sm mt-1">
                ℹ️ This payment will mark Invoice #{form.invoiceId} as COMPLETED
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {editing ? '💾 Save Payment' : '💳 Record Payment & Mark Invoice Completed'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); setForm({ invoiceId: '', amount: 0, method: 'cash' }); }} 
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
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
          placeholder="🔍 Search by invoice ID or payment method..."
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">⚙️</div>
              <div className="text-xl text-white">Loading payments...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="p-4 text-left text-white font-bold">📋 Invoice</th>
                  <th className="p-4 text-left text-white font-bold">� Customer</th>
                  <th className="p-4 text-left text-white font-bold">💵 Amount</th>
                  <th className="p-4 text-left text-white font-bold">💳 Method</th>
                  <th className="p-4 text-left text-white font-bold">📅 Date</th>
                  <th className="p-4 text-left text-white font-bold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredList.map(p => {
                  const invoice = invoices.find(inv => (inv.id || inv._id) == p.invoiceId);
                  const customer = customers.find(c => (c.id || c._id) == invoice?.customerId);
                  return (
                    <tr key={p.id || p._id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 text-yellow-400 font-bold">#{invoice?.invoiceId || p.invoiceId}</td>
                      <td className="p-4 text-slate-300">{customer?.name || 'N/A'}</td>
                      <td className="p-4 text-green-300 font-bold">₹{Number(p.amount).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          p.method?.toLowerCase() === 'cash' ? 'bg-green-500/20 text-green-300' :
                          p.method?.toLowerCase() === 'card' ? 'bg-blue-500/20 text-blue-300' :
                          p.method?.toLowerCase() === 'bank' ? 'bg-purple-500/20 text-purple-300' :
                          p.method?.toLowerCase() === 'upi' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {p.method?.toLowerCase() === 'cash' ? '💵 Cash' :
                           p.method?.toLowerCase() === 'card' ? '💳 Card' :
                           p.method?.toLowerCase() === 'bank' ? '🏦 Bank' :
                           p.method?.toLowerCase() === 'upi' ? '📱 UPI' :
                           p.method}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{p.paymentDate || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startEdit(p)} 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => remove(p.id || p._id)} 
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
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      <div className="text-6xl mb-4">📭</div>
                      <div className="text-xl">
                        {searchTerm ? 'No payments found matching your search' : 'No payments yet'}
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
          <span>📊 Total Payments: <strong className="text-white">{list.length}</strong></span>
          <span>🔍 Showing: <strong className="text-white">{filteredList.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
