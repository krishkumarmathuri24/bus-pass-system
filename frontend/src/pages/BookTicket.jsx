import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PASS_TYPES = [
  { value: 'single_ride', label: 'Single ride' },
  { value: 'day_pass', label: 'Day pass' },
  { value: 'weekly_pass', label: 'Weekly pass' },
  { value: 'monthly_pass', label: 'Monthly pass' },
];

export default function BookTicket() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState('');
  const [passType, setPassType] = useState('single_ride');
  const [pricing, setPricing] = useState([]);
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/buses').then((res) => {
      setBuses(res.data);
      if (res.data.length) setBusId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!busId) return;
    api.get(`/buses/${busId}/pricing`).then((res) => setPricing(res.data));
  }, [busId]);

  const activePrice = pricing.find((p) => p.passType === passType)?.price;

  async function handleBook() {
    if (!user) {
      setError('Please log in first.');
      return;
    }
    setBooking(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/tickets/book', { busId, passType });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Book a ticket</h2>

      <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Route</span>
          <select
            className="border rounded px-3 py-2"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>{b.routeName}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Pass type</span>
          <select
            className="border rounded px-3 py-2"
            value={passType}
            onChange={(e) => setPassType(e.target.value)}
          >
            {PASS_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>

        <p className="text-sm text-gray-600">
          Price: <span className="font-semibold text-gray-900">
            {activePrice != null ? `$${Number(activePrice).toFixed(2)}` : 'Loading...'}
          </span>
          {' '}(set by the server — never editable from here)
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

        <button
          onClick={handleBook}
          disabled={booking || !busId}
          className="bg-brand text-white rounded py-2 hover:bg-brand-dark disabled:opacity-50"
        >
          {booking ? 'Booking...' : 'Book & generate pass'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow p-5 mt-4 flex flex-col items-center gap-3">
          <h3 className="font-semibold">Your pass is ready</h3>
          <img src={result.qrImage} alt="Ticket QR code" className="w-48 h-48" />
          <p className="text-sm text-gray-600 text-center">
            {result.ticket.routeName} · {result.ticket.passType.replace('_', ' ')}<br />
            Valid until {new Date(result.ticket.validUntil).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
