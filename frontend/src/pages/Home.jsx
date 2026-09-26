import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loginAsDemo } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loadingBuses, setLoadingBuses] = useState(true);

  useEffect(() => {
    api.get('/buses')
      .then((res) => setBuses(res.data))
      .catch((err) => console.error('Error fetching buses:', err))
      .finally(() => setLoadingBuses(false));
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Modern Smart Transit Network 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Your City Bus Pass,{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Always in Your Pocket.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Skip lines and paper tickets. Book instant cryptographically signed QR passes, enjoy server-guaranteed honest pricing, and track live bus GPS movements in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Book a Pass Now</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/tracker"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-800 font-semibold border border-slate-200 hover:bg-slate-50 transition shadow-sm hover:shadow"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Bus Radar</span>
              </Link>
              {!user && (
                <button
                  onClick={() => loginAsDemo('rider')}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                >
                  <span>⚡ Quick Demo Rider</span>
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">4</p>
                <p className="text-xs text-slate-500 font-medium">Active Metro Corridors</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">8 min</p>
                <p className="text-xs text-slate-500 font-medium">Average Frequency</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</p>
                <p className="text-xs text-slate-500 font-medium">Digital QR Anti-Fraud</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20 transform -rotate-1"></div>
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/40 bg-white">
                <img
                  src="/assets/transit_hero.jpg"
                  alt="Modern City Transit Electric Bus"
                  className="w-full h-80 sm:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                
                {/* Floating pill 1: Live Status */}
                <div className="absolute top-4 left-4 glass-dark rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-300 font-medium leading-none">Route 12 Live</p>
                    <p className="text-xs font-bold text-white mt-0.5">Approaching City Hall</p>
                  </div>
                </div>

                {/* Floating pill 2: QR Pass Verified */}
                <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ✓
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">Instant QR Pass</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">256-bit Authenticated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Real-time Routes Quick Explorer */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Transit Corridors</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Active City Bus Routes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any corridor to book passes or track live bus arrivals.
            </p>
          </div>
          <Link
            to="/schedules"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View Full Timetable</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loadingBuses ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs tracking-wide border border-blue-100">
                      {bus.busNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {bus.routeName}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {bus.frequency || 'Every 10 mins'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Capacity: {bus.capacity} seats
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to="/book"
                    className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg transition shadow-xs flex-1 text-center"
                  >
                    Book Pass
                  </Link>
                  <Link
                    to="/tracker"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Track on Map"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mobile Experience & QR Technology Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Zero Queues · Contactless Boarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              One-Tap Mobile Boarding with Cryptographic Passes
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Every digital bus pass is generated with a time-bounded JSON Web Token and serialized into high-density 2D QR codes. Conductors verify tickets with offline-capable cryptographic signature validation that prevents duplicates and fake passes.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Centralized Fares</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Prices calculated server-side only; client tampering impossible.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Anti-Replay Protection</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Single-ride passes are automatically revoked upon initial scan.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/passes"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold transition shadow-lg shadow-blue-500/25"
              >
                <span>Open My Digital Passes</span>
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-sm rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700/60 group">
              <img
                src="/assets/mobile_pass.jpg"
                alt="Digital Bus Pass Mobile App"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                <p className="text-xs text-white/90 font-medium">
                  Scan & ride in under 0.8 seconds at any turnstile or conductor scanner.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Steps: How it works */}
      <section className="space-y-10 text-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Simplicity First</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            How It Works in 3 Quick Steps
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Experience friction-free transit from the moment you plan your trip to the moment you step off.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            {
              step: '01',
              title: 'Select Route & Pass Type',
              desc: 'Choose from Downtown, Airport, or Suburb routes. Pick single ride, day pass, weekly or monthly passes with real-time fair pricing.',
              icon: '🗺️',
            },
            {
              step: '02',
              title: 'Instant QR Generation',
              desc: 'Confirm payment and instantly receive an encrypted digital pass with high-density QR code saved directly to your account.',
              icon: '⚡',
            },
            {
              step: '03',
              title: 'Board & Track in Real Time',
              desc: 'Present your phone to the conductor scanner and track the live GPS position and ETA of your bus on the interactive live radar.',
              icon: '🚌',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <span className="text-4xl font-extrabold text-slate-100 group-hover:text-blue-100 transition-colors absolute top-4 right-4">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
