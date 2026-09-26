import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function formatRemaining(validUntil) {
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

export default function MyPasses() {
  const { user, loginAsDemo } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrModalImage, setQrModalImage] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'valid' | 'expired' | 'used'

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTickets();
  }, [user]);

  function fetchTickets() {
    setLoading(true);
    api.get('/tickets/mine')
      .then((res) => {
        setTickets(res.data);
      })
      .catch((err) => console.error('Error fetching tickets:', err))
      .finally(() => setLoading(false));
  }

  async function openPassModal(ticket) {
    setSelectedTicket(ticket);
    setLoadingQr(true);
    setQrModalImage(null);
    try {
      const { data } = await api.get(`/tickets/${ticket.id}/qr`);
      setQrModalImage(data.qrImage);
    } catch (err) {
      console.error('Failed to load QR:', err);
    } finally {
      setLoadingQr(false);
    }
  }

  const filteredTickets = tickets.filter((t) => {
    const isActuallyExpired = new Date(t.validUntil) < new Date();
    const effectiveStatus = (t.status === 'valid' && isActuallyExpired) ? 'expired' : t.status;
    if (filter === 'all') return true;
    return effectiveStatus === filter;
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-3xl">
          🎟️
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Transit Wallet</h2>
        <p className="text-sm text-slate-600">
          Sign in to view your active passes, boarding QR codes, and ride history.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => loginAsDemo('rider')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition"
          >
            ⚡ 1-Click Demo Rider
          </button>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
          >
            Sign In with Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Digital Transit Passes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your secure QR boarding passes anytime, even while offline.
          </p>
        </div>
        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition self-start sm:self-auto"
        >
          <span>+ Book New Pass</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Passes', count: tickets.length },
          {
            id: 'valid',
            label: 'Active & Valid',
            count: tickets.filter((t) => t.status === 'valid' && new Date(t.validUntil) >= new Date()).length,
          },
          {
            id: 'used',
            label: 'Used',
            count: tickets.filter((t) => t.status === 'used').length,
          },
          {
            id: 'expired',
            label: 'Expired',
            count: tickets.filter((t) => t.status === 'expired' || (t.status === 'valid' && new Date(t.validUntil) < new Date())).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filter === tab.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="text-4xl">🎫</div>
          <h3 className="text-lg font-bold text-slate-900">No passes found in this view</h3>
          <p className="text-xs text-slate-500">
            {filter === 'all'
              ? "You haven't booked any bus passes yet. Book one in seconds!"
              : `You have no passes matching the '${filter}' filter.`}
          </p>
          <Link
            to="/book"
            className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md"
          >
            Book a Pass Now
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((t) => {
            const isActuallyExpired = new Date(t.validUntil) < new Date();
            const effectiveStatus = (t.status === 'valid' && isActuallyExpired) ? 'expired' : t.status;
            const isValid = effectiveStatus === 'valid';

            return (
              <div
                key={t.id}
                className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-5 shadow-lg border border-slate-700/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl hover:border-slate-500 transition-all duration-300 pass-ticket-cutout"
              >
                <div>
                  {/* Top Bar: Route & Status Badge */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <span className="text-[10px] font-mono text-blue-300 font-bold bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-400/30">
                      {t.Bus?.busNumber || 'METRO'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isValid
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : effectiveStatus === 'used'
                          ? 'bg-slate-700/60 text-slate-300'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {effectiveStatus}
                    </span>
                  </div>

                  {/* Route name */}
                  <h3 className="font-extrabold text-base text-white tracking-tight line-clamp-1">
                    {t.Bus?.routeName || 'City Transit Corridor'}
                  </h3>

                  {/* Pass Type & Fare */}
                  <div className="flex items-center justify-between text-xs mt-2 text-slate-300">
                    <span className="capitalize font-semibold">{t.passType.replace('_', ' ')}</span>
                    <span className="font-extrabold text-emerald-400">${Number(t.priceCharged).toFixed(2)}</span>
                  </div>

                  {/* Validity Countdown */}
                  <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Validity Status</p>
                    <p className={`font-semibold mt-0.5 ${isValid ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isValid ? `⏱️ ${formatRemaining(t.validUntil)}` : `Expired ${new Date(t.validUntil).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-dashed border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openPassModal(t)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <span>📱 Scan QR Pass</span>
                  </button>
                  <Link
                    to="/tracker"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                    title="Track Bus on Radar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Boarding Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Official Digital Boarding Pass
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                {selectedTicket.Bus?.routeName || 'City Transit Pass'}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedTicket.passType.replace('_', ' ')} · ${Number(selectedTicket.priceCharged).toFixed(2)}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[220px]">
              {loadingQr ? (
                <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Secure 2D Barcode...</span>
                </div>
              ) : qrModalImage ? (
                <img
                  src={qrModalImage}
                  alt="Boarding Pass QR"
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <p className="text-xs text-red-500">Failed to render QR</p>
              )}
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Valid Until: <strong className="text-slate-900">{new Date(selectedTicket.validUntil).toLocaleString()}</strong></p>
              <p className="font-mono text-[10px] text-slate-400 truncate">ID: {selectedTicket.id}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                🖨️ Print Pass
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
