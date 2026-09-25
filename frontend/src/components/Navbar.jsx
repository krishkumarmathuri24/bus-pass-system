import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/book', label: 'Book Ticket' },
    { to: '/passes', label: 'My Passes' },
    { to: '/tracker', label: 'Bus Tracker' },
  ];

  return (
    <nav className="bg-brand text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-semibold text-lg">City Bus Pass</Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-blue-200">{l.label}</Link>
          ))}
          {user ? (
            <button onClick={logout} className="bg-brand-dark px-3 py-1 rounded hover:bg-blue-900">
              Log out
            </button>
          ) : (
            <Link to="/login" className="bg-brand-dark px-3 py-1 rounded hover:bg-blue-900">
              Log in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-2 px-4 pb-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="hover:text-blue-200">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={logout} className="text-left hover:text-blue-200">Log out</button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="hover:text-blue-200">Log in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
