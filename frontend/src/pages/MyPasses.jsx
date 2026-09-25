import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  valid: 'bg-green-100 text-green-700',
  used: 'bg-gray-100 text-gray-600',
  expired: 'bg-amber-100 text-amber-700',
  revoked: 'bg-red-100 text-red-700',
};

export default function MyPasses() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [qrByTicket, setQrByTicket] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get('/tickets/mine').then((res) => {
      setTickets(res.data);
      setLoading(false);
    });
  }, [user]);

  async function showQr(ticketId) {
    if (qrByTicket[ticketId]) return; // already fetched
    const { data } = await api.get(`/tickets/${ticketId}/qr`);
    setQrByTicket((prev) => ({ ...prev, [ticketId]: data.qrImage }));
  }

  if (!user) {
    return <p className="text-gray-600">Log in to see your passes.</p>;
  }
  if (loading) return <p className="text-gray-600">Loading passes...</p>;
  if (tickets.length === 0) {
    return <p className="text-gray-600">You don't have any passes yet. Book one from the Book Ticket page.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-3">
      <h2 className="text-xl font-semibold mb-2">My passes</h2>
      {tickets.map((t) => (
        <div key={t.id} className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium">{t.Bus?.routeName || 'Route'}</p>
            <p className="text-sm text-gray-600">
              {t.passType.replace('_', ' ')} · ${Number(t.priceCharged).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              Valid until {new Date(t.validUntil).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[t.status]}`}>
              {t.status}
            </span>
            <button
              onClick={() => showQr(t.id)}
              className="text-sm text-brand hover:underline"
            >
              {qrByTicket[t.id] ? '' : 'Show QR'}
            </button>
          </div>
          {qrByTicket[t.id] && (
            <img src={qrByTicket[t.id]} alt="Pass QR code" className="w-24 h-24" />
          )}
        </div>
      ))}
    </div>
  );
}
