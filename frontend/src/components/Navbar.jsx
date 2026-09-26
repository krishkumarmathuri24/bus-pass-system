import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, loginAsDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/book', label: 'Book Ticket' },
    { to: '/passes', label: 'My Passes' },
    { to: '/tracker', label: 'Live Radar', badge: 'LIVE' },
    { to: '/schedules', label: 'Schedules' },
    { to: '/verifier', label: 'Verify Pass' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CityLink Transit
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold -mt-1">
                Cloud Bus Pass System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive(l.to)
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {l.label}
                {l.badge && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {l.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Auth status & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-blue-400 font-medium capitalize">
                      {user.role === 'admin' ? 'Inspector/Admin' : 'Rider Pass'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 transition-colors"
                  title="Sign Out"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loginAsDemo('rider')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-blue-300 hover:bg-slate-700/80 border border-slate-700 font-medium transition"
                  title="1-Click Demo Login"
                >
                  ⚡ Demo Rider
                </button>
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all hover:shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <button
                onClick={() => loginAsDemo('rider')}
                className="text-[11px] px-2.5 py-1 rounded bg-blue-600 text-white font-medium"
              >
                Demo
              </button>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-medium flex items-center justify-between ${
                isActive(l.to)
                  ? 'bg-blue-600/20 text-blue-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{l.label}</span>
              {l.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 mt-2">
            {user ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                  <p className="text-xs text-blue-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded bg-slate-800"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => { loginAsDemo('rider'); setOpen(false); }}
                  className="py-2 text-center rounded-lg bg-slate-800 text-blue-300 text-sm font-medium border border-slate-700"
                >
                  Demo Login
                </button>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2 text-center rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
