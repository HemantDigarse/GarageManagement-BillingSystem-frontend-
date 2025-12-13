import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  
  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const username = localStorage.getItem('username') || 'User'

  return (
    <div className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 shadow-lg ${
      theme === 'dark' 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span className="text-2xl">🚗</span>
        </div>
        <div>
          <div className="text-xl font-bold text-white">Garage Management</div>
          <div className="text-xs text-purple-200">Your Auto Care Partner</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <span className="text-lg">👤</span>
          <span className="text-white font-medium">{username}</span>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-white/20 rounded-lg text-white font-medium hover:bg-white/30 hover:scale-105 active:scale-95 shadow-lg transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button 
          onClick={logout} 
          className="px-4 py-2 bg-rose-500 rounded-lg text-white font-medium hover:bg-rose-600 hover:scale-105 active:scale-95 shadow-lg"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
