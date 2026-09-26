import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PassVerifier() {
  const { user, loginAsDemo } = useAuth();
  const [passInput, setPassInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  async function handleVerify(e) {
    if (e) e.preventDefault();
    if (!passInput.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setActionMessage('');

    try {
      // Check if input looks like a JWT token or UUID ticket ID
      const isToken = passInput.startsWith('ey') || passInput.length > 80;
      
      if (isToken && user?.role === 'admin') {
        // Conductor official validation endpoint
        const { data } = await api.post('/tickets/validate', { qrToken: passInput });
        setResult(data);
      } else if (isToken) {
        // Normal validation
        const { data } = await api.post('/tickets/validate', { qrToken: passInput });
        setResult(data);
      } else {
        // Check by Ticket ID
        const { data } = await api.get(`/tickets/verify/${passInput.trim()}`);
        setResult(data);
      }
    } catch (err) {
      if (err.response?.data) {
        setResult(err.response.data);
      } else {
        setError('Verification request failed. Ensure backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkUsed() {
    if (!result?.ticket?.id) return;
    setLoading(true);
    setActionMessage('');
    try {
      const { data } = await api.post('/tickets/validate', { ticketId: result.ticket.id });
      setResult(data);
      setActionMessage('✓ Pass has been marked as USED in the central system.');
    } catch (err) {
      setError(err.response?.data?.reason || 'Failed to mark pass as used');
    } finally {
      setLoading(false);
    }
  }

  // Quick helper to test with a seeded pass ID or user's passes
  async function loadSamplePass() {
    try {
      const { data } = await api.get('/tickets/mine');
      if (data && data.length > 0) {
        setPassInput(data[0].id);
      } else {
        setPassInput('79641783-1d27-4b08-94d4-1ed751055adb');
      }
    } catch {
      setPassInput('79641783-1d27-4b08-94d4-1ed751055adb');
    }
  }

  const isValid = result?.valid === true;
  const isUsed = result?.status === 'used' || result?.ticket?.status === 'used';
  const isExpired = result?.status === 'expired' || result?.ticket?.status === 'expired';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Official Inspection Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Transit Pass & QR Verifier
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Validate digital passes, detect counterfeit or replayed tickets, and confirm fare validity.
        </p>
      </div>

      {/* Role Notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span>
            Current Status:{' '}
            <strong className="text-blue-300">
              {user ? `${user.name} (${user.role.toUpperCase()})` : 'Public Inspector Mode'}
            </strong>
          </span>
        </div>
        {user?.role !== 'admin' && (
          <button
            onClick={() => loginAsDemo('admin')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition self-start sm:self-auto"
          >
            ⚡ Switch to Conductor / Admin
          </button>
        )}
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-sm font-bold text-slate-900">
            Enter Ticket ID or Scanned QR Token:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="e.g. 79641783-1d27-4b08-94d4-1ed751055adb or paste jwt..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !passInput.trim()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition whitespace-nowrap"
            >
              {loading ? 'Verifying...' : 'Verify Pass'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Supports 36-char Pass UUIDs or 256-bit signed QR tokens.</span>
            <button
              type="button"
              onClick={loadSamplePass}
              className="text-blue-600 hover:underline font-semibold"
            >
              Paste Sample Pass ID
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className={`rounded-3xl border p-6 sm:p-8 text-left space-y-6 shadow-xl animate-fadeIn ${
          isValid
            ? 'bg-emerald-50/50 border-emerald-300'
            : isExpired
            ? 'bg-amber-50/50 border-amber-300'
            : 'bg-red-50/50 border-red-300'
        }`}>
          {/* Header Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md ${
                isValid ? 'bg-emerald-600' : isExpired ? 'bg-amber-500' : 'bg-red-600'
              }`}>
                {isValid ? '✓' : isExpired ? '⏱️' : '✕'}
              </div>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isValid
                    ? 'bg-emerald-100 text-emerald-800'
                    : isExpired
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isValid ? 'PASSED · APPROVED FOR BOARDING' : isExpired ? 'EXPIRED PASS' : 'INVALID / REJECTED'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {result.reason || (isValid ? 'Pass is valid & verified' : 'Ticket rejected')}
                </h3>
              </div>
            </div>
          </div>

          {actionMessage && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              {actionMessage}
            </div>
          )}

          {/* Ticket Information Breakdown */}
          {result.ticket && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-xs">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                Pass Credentials
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Route Corridor:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {result.ticket.routeName || result.ticket.Bus?.routeName || 'City Transit Route'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Pass Type:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 capitalize">
                    {result.ticket.passType?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Fare Charged:</span>
                  <p className="font-bold text-emerald-600 text-sm mt-0.5">
                    ${Number(result.ticket.priceCharged || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Passenger:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {result.ticket.passengerName || result.ticket.User?.name || 'Verified Rider'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Valid From:</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {new Date(result.ticket.validFrom).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Valid Until:</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {new Date(result.ticket.validUntil).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conductor action button */}
          {isValid && result.ticket?.passType === 'single_ride' && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleMarkUsed}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
              >
                Mark Single Ride as Used (Prevent Replay)
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
