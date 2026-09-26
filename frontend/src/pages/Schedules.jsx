import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Schedules() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    api.get('/buses')
      .then((res) => {
        setBuses(res.data);
        if (res.data.length > 0) setSelectedRoute(res.data[0]);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          City Transit Network 2026
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Route Corridors & Timetables
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Explore complete stop sequences, departure frequencies, and fixed fare charts across the metropolitan region.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Route Selector list */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider px-1">
              Select Corridor ({buses.length})
            </h3>
            {buses.map((b) => {
              const isSelected = selectedRoute?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedRoute(b)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold bg-white border border-slate-200 text-slate-900">
                      {b.busNumber}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      ● Active
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {b.routeName}
                  </h4>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>⏱️ {b.frequency || 'Every 10 mins'}</span>
                    <span>🚌 {b.capacity} Seats</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Corridor Details & Stop Schedule */}
          {selectedRoute && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {selectedRoute.busNumber}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedRoute.routeName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hours: {selectedRoute.operatingHours || '05:30 AM - 11:30 PM'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/book"
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition"
                  >
                    Book This Route
                  </Link>
                  <Link
                    to="/tracker"
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Track Live
                  </Link>
                </div>
              </div>

              {/* Stop Sequence Timeline */}
              <div>
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4">
                  Scheduled Transit Stops
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100 pl-8">
                  {selectedRoute.stops?.map((stop, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{stop.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">GPS: {stop.lat}, {stop.lng}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Stop {idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fare Chart Table */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3">
                  Standard Fare Tiers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Single Ride</p>
                    <p className="text-lg font-extrabold text-blue-700 mt-0.5">$2.50 - $6.00</p>
                    <p className="text-[9px] text-slate-400">2 Hours</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Day Pass</p>
                    <p className="text-lg font-extrabold text-blue-700 mt-0.5">$7.00 - $15.00</p>
                    <p className="text-[9px] text-slate-400">24 Hours</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Weekly Pass</p>
                    <p className="text-lg font-extrabold text-blue-700 mt-0.5">$30.00 - $55.00</p>
                    <p className="text-[9px] text-slate-400">7 Days</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Monthly Pass</p>
                    <p className="text-lg font-extrabold text-blue-700 mt-0.5">$90.00 - $160.00</p>
                    <p className="text-[9px] text-slate-400">30 Days</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
