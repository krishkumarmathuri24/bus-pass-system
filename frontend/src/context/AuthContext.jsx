import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function signup(name, email, password, phone) {
    const { data } = await api.post('/auth/signup', { name, email, password, phone });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function loginAsDemo(role = 'rider') {
    const email = role === 'admin' ? 'admin@citybus.com' : 'krishkumarmathuri@gmail.com';
    const password = role === 'admin' ? 'admin123' : 'password123';
    try {
      return await login(email, password);
    } catch (err) {
      console.warn('Backend login unavailable, creating offline demo session for testing:', err.message);
      const fallbackUser = role === 'admin'
        ? { id: 'admin-demo-uuid', name: 'Transit Officer Sarah', email: 'admin@citybus.com', role: 'admin' }
        : { id: '8be05e4f-b6ff-481b-8de2-e149bae4e142', name: 'Krish Kumar Mathuri', email: 'krishkumarmathuri@gmail.com', role: 'rider', phone: '+91 98765 43210' };
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      localStorage.setItem('token', 'demo-session-token');
      setUser(fallbackUser);
      return fallbackUser;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
