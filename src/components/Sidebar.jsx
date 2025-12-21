import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/dashboard', label: 'DashBoard', icon: '' },
  { to: '/customers', label: 'Customers', icon: '' },
  { to: '/vehicles', label: 'Vehicles', icon: '' },
  { to: '/services', label: 'Services', icon: '' },
  { to: '/invoices', label: 'Payment', icon: '' }
]

export default function Sidebar() {
  const { theme } = useTheme()
  
  return (
    <aside className={`w-64 h-full border-r hidden md:block shadow-xl overflow-y-auto flex-shrink-0 ${
      theme === 'dark'
        ? 'bg-slate-800/95 backdrop-blur-sm border-slate-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-5 border-b sticky top-0 z-10 ${
        theme === 'dark'
          ? 'border-slate-700/50 bg-slate-800/95'
          : 'border-gray-200 bg-white'
      }`}>
        <div className={`text-lg font-bold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Menu</div>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        }`}>Navigate through pages</div>
      </div>
      <nav className="flex flex-col gap-2 p-3">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({isActive}) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700/70 hover:text-white hover:scale-105 hover:pl-5'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105 hover:pl-5'
              }`
            }
          >
            <span className="text-xl">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
