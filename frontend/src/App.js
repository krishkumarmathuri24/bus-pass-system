import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import BookTicket from './pages/BookTicket';
import MyPasses from './pages/MyPasses';
import BusTracker from './pages/BusTracker';
import PassVerifier from './pages/PassVerifier';
import Schedules from './pages/Schedules';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book" element={<BookTicket />} />
          <Route path="/passes" element={<MyPasses />} />
          <Route path="/tracker" element={<BusTracker />} />
          <Route path="/verifier" element={<PassVerifier />} />
          <Route path="/schedules" element={<Schedules />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
