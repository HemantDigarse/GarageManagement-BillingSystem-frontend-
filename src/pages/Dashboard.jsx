// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCustomers } from '../api/customersApi';
import { listVehicles } from '../api/vehiclesApi';
import { listInvoices } from '../api/invoicesApi';

export default function Dashboard() {
  const [counts, setCounts] = useState({ customers: 0, vehicles: 0, invoices: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [cResp, vResp, iResp] = await Promise.all([
          listCustomers().catch(() => []),
          listVehicles().catch(() => []),
          listInvoices().catch(() => []),
        ]);
        setCounts({
          customers: Array.isArray(cResp) ? cResp.length : 0,
          vehicles: Array.isArray(vResp) ? vResp.length : 0,
          invoices: Array.isArray(iResp) ? iResp.length : 0
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">⚙️</div>
        <div className="text-xl text-white">Loading dashboard...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-red-500/20 border border-red-500 rounded-lg">
      <div className="text-red-200 flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        <span>{error}</span>
      </div>
    </div>
  );

  const stats = [
    { 
      label: 'Total Customers', 
      value: counts.customers, 
      icon: '👥', 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-300'
    },
    { 
      label: 'Total Vehicles', 
      value: counts.vehicles, 
      icon: '🚗', 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-300'
    },
    { 
      label: 'Total Invoices', 
      value: counts.invoices, 
      icon: '💰', 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2">📊 Dashboard</h1>
        <p className="text-slate-300">Welcome back! Here's your garage overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/customers')}
          className="card-hover bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl shadow-xl border border-white/10 cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-500/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <span className="text-4xl">👥</span>
            </div>
            <div className="text-white/80 text-sm font-medium">View All</div>
          </div>
          <div className="text-white/90 text-sm font-medium mb-1">Total Customers</div>
          <div className="text-4xl font-bold text-white">{counts.customers}</div>
        </div>
        <div 
          onClick={() => navigate('/vehicles')}
          className="card-hover bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-xl shadow-xl border border-white/10 cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-500/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <span className="text-4xl">🚗</span>
            </div>
            <div className="text-white/80 text-sm font-medium">View All</div>
          </div>
          <div className="text-white/90 text-sm font-medium mb-1">Total Vehicles</div>
          <div className="text-4xl font-bold text-white">{counts.vehicles}</div>
        </div>
        <div 
          onClick={() => navigate('/invoices')}
          className="card-hover bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl shadow-xl border border-white/10 cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-purple-500/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <span className="text-4xl">💰</span>
            </div>
            <div className="text-white/80 text-sm font-medium">View All</div>
          </div>
          <div className="text-white/90 text-sm font-medium mb-1">Total Invoices</div>
          <div className="text-4xl font-bold text-white">{counts.invoices}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:scale-105 transition-transform shadow-lg cursor-pointer"
          >
            <span className="text-2xl">👥</span>
            <span className="text-white font-medium">Customers</span>
          </button>
          <button 
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:scale-105 transition-transform shadow-lg cursor-pointer"
          >
            <span className="text-2xl">🚗</span>
            <span className="text-white font-medium">Vehicles</span>
          </button>
          <button 
            onClick={() => navigate('/services')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:scale-105 transition-transform shadow-lg cursor-pointer"
          >
            <span className="text-2xl">🔧</span>
            <span className="text-white font-medium">Services</span>
          </button>
          <button 
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:scale-105 transition-transform shadow-lg cursor-pointer"
          >
            <span className="text-2xl">💳</span>
            <span className="text-white font-medium">Payments</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📈</span> Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <div className="text-white font-medium">New customer registered</div>
              <div className="text-slate-400 text-sm">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <span className="text-2xl">🔧</span>
            <div className="flex-1">
              <div className="text-white font-medium">Service completed</div>
              <div className="text-slate-400 text-sm">5 hours ago</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <span className="text-2xl">💰</span>
            <div className="flex-1">
              <div className="text-white font-medium">Payment received</div>
              <div className="text-slate-400 text-sm">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
