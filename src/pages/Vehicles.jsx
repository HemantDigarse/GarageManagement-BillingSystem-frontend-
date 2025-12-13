import React, { useEffect, useState } from "react";
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../api/vehiclesApi";
import { listCustomers } from "../api/customersApi";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    fuelType: "",
    customerId: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load vehicles
  const loadVehicles = async () => {
    try {
      const data = await listVehicles();
      setVehicles(data);
      setError("");
    } catch (err) {
      setError("Failed to load vehicles");
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      const data = await listCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadCustomers();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) {
      setError("Customer ID is required");
      return;
    }

    try {
      if (editingId) {
        await updateVehicle(editingId, form);
        setSuccess("✅ Vehicle updated successfully!");
      } else {
        await createVehicle(form);
        setSuccess("✅ Vehicle created successfully!");
      }
      setForm({
        plateNumber: "",
        brand: "",
        model: "",
        fuelType: "",
        customerId: "",
      });
      setEditingId(null);
      loadVehicles();
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ Create/Update failed");
    }
  };

  // Edit
  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm(vehicle);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteVehicle(id);
      setSuccess("✅ Vehicle deleted successfully!");
      loadVehicles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ Delete failed");
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-600">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🚗</span> Vehicles Management
        </h1>
        <p className="text-slate-300">Manage your vehicle fleet</p>
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
          <span>{editingId ? '✏️' : '➕'}</span>
          {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-6">
          <input
            name="plateNumber"
            placeholder="🔢 Plate Number"
            value={form.plateNumber}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
          />
          <input
            name="brand"
            placeholder="🏭 Brand"
            value={form.brand}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
          />
          <input
            name="model"
            placeholder="🚙 Model"
            value={form.model}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
          />
          <select
            name="fuelType"
            value={form.fuelType}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="">⛽ Select Fuel Type</option>
            <option value="Petrol">⛽ Petrol</option>
            <option value="Diesel">🛢️ Diesel</option>
            <option value="Electric">⚡ Electric</option>
            <option value="Hybrid">🔋 Hybrid</option>
            <option value="CNG">💨 CNG</option>
            <option value="LPG">🔥 LPG</option>
          </select>
          <select
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-white border-2 border-slate-300 text-black font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="">👤 Select Owner</option>
            {customers.map((customer) => (
              <option key={customer.id || customer._id} value={customer.id || customer._id}>
                {customer.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {editingId ? '💾 Save' : '➕ Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ plateNumber: "", brand: "", model: "", fuelType: "", customerId: "" });
                }}
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
          placeholder="🔍 Search vehicles by plate, brand, or model..."
          className="w-full p-3 rounded-lg bg-white border-2 border-slate-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
        />
      </div>

      {/* Vehicles Table */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <tr>
                <th className="p-4 text-left text-white font-bold">🔢 Plate No</th>
                <th className="p-4 text-left text-white font-bold">🏭 Brand</th>
                <th className="p-4 text-left text-white font-bold">🚙 Model</th>
                <th className="p-4 text-left text-white font-bold">⛽ Fuel</th>
                <th className="p-4 text-left text-white font-bold">👤 Owner</th>
                <th className="p-4 text-left text-white font-bold">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    <div className="text-6xl mb-4">📦</div>
                    <div className="text-xl">
                      {searchTerm ? 'No vehicles found matching your search' : 'No vehicles yet'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const owner = customers.find(c => (c.id || c._id) == v.customerId);
                  return (
                  <tr key={v.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-white font-medium">{v.plateNumber}</td>
                    <td className="p-4 text-slate-300">{v.brand}</td>
                    <td className="p-4 text-slate-300">{v.model}</td>
                    <td className="p-4 text-slate-300">{v.fuelType}</td>
                    <td className="p-4 text-slate-300">{owner?.name || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(v)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-600">
        <div className="flex items-center justify-between text-slate-300">
          <span>📊 Total Vehicles: <strong className="text-white">{vehicles.length}</strong></span>
          <span>🔍 Showing: <strong className="text-white">{filteredVehicles.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
