import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCustomers } from '../api/customersApi';
import { listVehicles } from '../api/vehiclesApi';
import { listInvoices } from '../api/invoicesApi';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    customers: 0,
    vehicles: 0,
    invoices: 0,
  });
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
          invoices: Array.isArray(iResp) ? iResp.length : 0,
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <div className="text-xl text-white">Loading dashboard...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-500/20 border border-red-500 rounded-lg">
        <div className="text-red-200 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );

  const chartData = [
    { name: 'Customers', value: counts.customers },
    { name: 'Vehicles', value: counts.vehicles },
    { name: 'Invoices', value: counts.invoices },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2"> Dashboard</h1>
        <p className="text-slate-300">
          Welcome back! Here's your garage overview
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/customers')}
          className="cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl shadow-xl"
        >
          <div className="text-white text-sm">Total Customers</div>
          <div className="text-4xl font-bold text-white">
            {counts.customers}
          </div>
        </div>

        <div
          onClick={() => navigate('/vehicles')}
          className="cursor-pointer bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-xl shadow-xl"
        >
          <div className="text-white text-sm">Total Vehicles</div>
          <div className="text-4xl font-bold text-white">
            {counts.vehicles}
          </div>
        </div>

        <div
          onClick={() => navigate('/invoices')}
          className="cursor-pointer bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl shadow-xl"
        >
          <div className="text-white text-sm">Total Invoices</div>
          <div className="text-4xl font-bold text-white">
            {counts.invoices}
          </div>
        </div>
      </div>

      {/* 📊 CHART */}
      <div className="bg-slate-800/90 p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4">
          System Statistics
        </h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-slate-800/90 p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-4 bg-indigo-500 text-white rounded-lg"
          >
            Customers
          </button>

          <button
            onClick={() => navigate('/vehicles')}
            className="p-4 bg-green-500 text-white rounded-lg"
          >
             Vehicles
          </button>

          <button
            onClick={() => navigate('/services')}
            className="p-4 bg-orange-500 text-white rounded-lg"
          >
           Services
          </button>

          <button
            onClick={() => navigate('/invoices')}
            className="p-4 bg-pink-500 text-white rounded-lg"
          >
             Payments
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-slate-800/90 p-6 rounded-xl shadow-xl border border-slate-600">
        <h2 className="text-xl font-bold text-white mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3">
          <div className="p-4 bg-slate-700 rounded-lg text-white">
            New customer registered
          </div>
          <div className="p-4 bg-slate-700 rounded-lg text-white">
            Service completed
          </div>
          <div className="p-4 bg-slate-700 rounded-lg text-white">
            Payment received
          </div>
        </div>
      </div>

    </div>
  );
}