import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import BookTicket from './pages/BookTicket';
import MyPasses from './pages/MyPasses';
import BusTracker from './pages/BusTracker';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book" element={<BookTicket />} />
          <Route path="/passes" element={<MyPasses />} />
          <Route path="/tracker" element={<BusTracker />} />
        </Routes>
      </main>
    </div>
  );
}
