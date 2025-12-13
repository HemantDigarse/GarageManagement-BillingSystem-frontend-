import React, { useState } from "react";
import { loginUser } from "../api/authApi";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ email, password });
      // backend in your project returns text like "LOGIN_SUCCESS"
      if (res.data === "LOGIN_SUCCESS" || res.data === "LOGIN_SUCCESS") {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "/dashboard";
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Server error / CORS (check backend)");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Welcome back</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full py-3 bg-accent text-white rounded-md font-medium hover:bg-cyan-400"
          >
            Sign in
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-4">
          Use <strong>admin@example.com</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}
