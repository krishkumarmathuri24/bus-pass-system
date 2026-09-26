import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password, form.phone);
      }
      navigate('/book');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickDemo(role) {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo(role);
      navigate(role === 'admin' ? '/verifier' : '/book');
    } catch (err) {
      setError('Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      
      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto text-xl font-bold shadow-lg shadow-blue-600/30 mb-3">
          CL
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'login' ? 'Welcome Back, Rider' : 'Create Transit Account'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login'
            ? 'Sign in to access your digital passes and real-time transit wallet'
            : 'Join thousands of riders enjoying seamless digital bus ticketing'}
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* 1-Click Quick Demo Access */}
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
            <span>⚡ Instant Demo Access (No typing needed)</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('rider')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-slate-800 text-xs font-bold shadow-xs hover:bg-blue-50/50 transition text-left"
            >
              <p className="text-blue-600">Rider Account</p>
              <p className="text-[10px] text-slate-500 font-normal">Krish Kumar</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 text-slate-800 text-xs font-bold shadow-xs hover:bg-indigo-50/50 transition text-left"
            >
              <p className="text-indigo-600">Inspector / Admin</p>
              <p className="text-[10px] text-slate-500 font-normal">Conductor Mode</p>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase">
            or sign in with credentials
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="rider@citybus.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 555-0123"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Create Account'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login'
              ? "Don't have an account yet? Sign up for free"
              : 'Already have an account? Sign in here'}
          </button>
        </div>

      </div>

    </div>
  );
}
