import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password, form.phone);
      }
      navigate('/book');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">
        {mode === 'login' ? 'Log in' : 'Create an account'}
      </h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2 mb-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            className="border rounded px-3 py-2"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded px-3 py-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          required
        />
        {mode === 'signup' && (
          <input
            className="border rounded px-3 py-2"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        )}
        <button type="submit" className="bg-brand text-white rounded py-2 hover:bg-brand-dark">
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button
        className="text-sm text-brand mt-4"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
