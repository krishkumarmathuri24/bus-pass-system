import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                CL
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">CityLink Transit</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cloud-native intelligent bus ticketing & real-time passenger information network. Zero-fraud QR validation and live GPS tracking.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                API & GPS Live: Operational
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Transit Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/book" className="hover:text-blue-400 transition">Book Smart Pass</Link></li>
              <li><Link to="/passes" className="hover:text-blue-400 transition">My Digital Wallet</Link></li>
              <li><Link to="/tracker" className="hover:text-blue-400 transition">Live Bus Radar</Link></li>
              <li><Link to="/schedules" className="hover:text-blue-400 transition">Timetables & Routes</Link></li>
            </ul>
          </div>

          {/* Security & Verification */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Verification & Safety</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/verifier" className="hover:text-blue-400 transition">Conductor QR Verifier</Link></li>
              <li><span className="text-slate-400">HMAC-SHA256 Token Signing</span></li>
              <li><span className="text-slate-400">Anti-Replay Pass Guard</span></li>
              <li><span className="text-slate-400">Centralized Dynamic Pricing</span></li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Transit Desk</h4>
            <p className="text-sm text-slate-400 mb-2">
              Helpline: <strong className="text-white">1-800-CITY-BUS</strong>
            </p>
            <p className="text-sm text-slate-400 mb-3">
              City Transit Control Center, 24/7 Monitoring
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">SQLite / PG Cloud</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">React 18</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">Leaflet Maps</span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CityLink Bus Pass System. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Terms of Carriage</span>
            <span>Privacy Policy</span>
            <span>System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
