import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const res = await login({ email, password })
      // backend may return token or text. Adjust accordingly:
      // if res contains token:
      if (res?.token) {
        localStorage.setItem('token', res.token)
      } else if (typeof res === 'string') {
        // if backend returns "LOGIN_SUCCESS", we may not have token. That's okay for dev.
        localStorage.setItem('token', 'dummy-token')
      } else if (res?.accessToken) {
        localStorage.setItem('token', res.accessToken)
      }
      localStorage.setItem('username', email.split('@')[0])
      nav('/')
    } catch (error) {
      setErr(error?.response?.data || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4 animate-bounce">
            <span className="text-6xl">🚗</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Garage Management</h1>
          <p className="text-purple-200">Sign in to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back! 👋</h2>
          
          {err && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{err}</span>
            </div>
          )}
          
          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email Address</label>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔒 Password</label>
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span> Signing in...
                </span>
              ) : (
                <span>🚀 Sign In</span>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Don't have an account? <span className="text-purple-600 font-semibold cursor-pointer hover:underline">Contact Admin</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>© 2025 Garage Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
