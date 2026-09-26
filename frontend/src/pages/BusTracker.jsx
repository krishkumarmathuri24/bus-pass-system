import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import api from '../api/axios';

// Custom modern SVG markers using Leaflet DivIcon
const createBusDivIcon = (busNumber) => L.divIcon({
  className: 'bus-pulse-marker',
  html: `
    <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(37, 99, 235, 0.4);" class="radar-ping"></div>
      <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: #1d4ed8; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(29, 78, 216, 0.5); border: 3px solid white; font-size: 18px;">
        🚌
      </div>
      <div style="position: absolute; bottom: -6px; background: #0f172a; color: #60a5fa; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 6px; border: 1px solid #3b82f6; white-space: nowrap;">
        ${busNumber || 'BUS'}
      </div>
    </div>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const createStopDivIcon = (index, isNext) => L.divIcon({
  className: 'stop-pin-marker',
  html: `
    <div style="width: 22px; height: 22px; border-radius: 50%; background: ${isNext ? '#10b981' : '#334155'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); ${isNext ? 'ring: 3px solid #6ee7b7;' : ''}">
      ${index + 1}
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function BusTracker() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [telemetry, setTelemetry] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastPingTime, setLastPingTime] = useState(new Date());

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const stopsLayerGroupRef = useRef(null);
  const polylineRef = useRef(null);

  // 1. Fetch available buses
  useEffect(() => {
    api.get('/buses').then((res) => {
      setBuses(res.data);
      if (res.data.length) setSelectedBusId(res.data[0].id);
    }).catch((err) => console.error(err));
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      stopsLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Poll bus location and telemetry
  useEffect(() => {
    if (!selectedBusId || !mapInstanceRef.current) return;
    let cancelled = false;

    async function fetchLocation() {
      try {
        const { data } = await api.get(`/buses/${selectedBusId}/location`);
        if (cancelled) return;
        setTelemetry(data);
        setLastPingTime(new Date());

        const map = mapInstanceRef.current;
        if (!map) return;

        const currentPos = [data.lat, data.lng];

        // Update or create bus marker
        if (!busMarkerRef.current) {
          busMarkerRef.current = L.marker(currentPos, {
            icon: createBusDivIcon(data.busNumber),
          }).addTo(map);
          map.setView(currentPos, 13);
        } else {
          busMarkerRef.current.setLatLng(currentPos);
          busMarkerRef.current.setIcon(createBusDivIcon(data.busNumber));
        }

        // Bind informative popup
        busMarkerRef.current.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong style="color: #1d4ed8; font-size: 13px;">${data.routeName}</strong><br/>
            <span>Bus: <b>${data.busNumber}</b></span><br/>
            <span>Speed: <b>${data.speedKmH || 35} km/h</b></span><br/>
            <span>Next Stop: <b style="color: #059669;">${data.nextStop}</b></span><br/>
            <span>Occupancy: <b>${data.occupancy}/${data.capacity} seats</b></span>
          </div>
        `);

        // Render stops and polyline
        if (stopsLayerGroupRef.current) {
          stopsLayerGroupRef.current.clearLayers();
          if (data.stops && data.stops.length > 0) {
            const latLngs = data.stops.map((s) => [s.lat, s.lng]);

            // Draw route line
            if (polylineRef.current) {
              polylineRef.current.remove();
            }
            polylineRef.current = L.polyline(latLngs, {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
            }).addTo(map);

            // Add stop pins
            data.stops.forEach((stop, idx) => {
              const isNext = stop.name === data.nextStop;
              const marker = L.marker([stop.lat, stop.lng], {
                icon: createStopDivIcon(idx, isNext),
              });
              marker.bindPopup(`
                <div style="font-size: 12px;">
                  <b>Stop ${idx + 1}: ${stop.name}</b><br/>
                  ${isNext ? '<span style="color: #10b981; font-weight: bold;">● Next Approaching Stop</span>' : 'Scheduled corridor stop'}
                </div>
              `);
              stopsLayerGroupRef.current.addLayer(marker);
            });
          }
        }
      } catch (err) {
        console.error('Error fetching bus telemetry:', err);
      }
    }

    fetchLocation();

    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchLocation, 4000);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [selectedBusId, autoRefresh]);

  const selectedBus = buses.find((b) => b.id === selectedBusId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Bus GPS Radar
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time GPS coordinates, vehicle speed, passenger occupancy, and corridor stops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600"
            />
            Auto-ping (4s)
          </label>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Updated {lastPingTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Corridor Selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {buses.map((b) => {
          const isSelected = b.id === selectedBusId;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBusId(b.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="font-mono">{b.busNumber}</span>
              <span>·</span>
              <span>{b.routeName.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Radar Layout: 2 Columns (Map + Telemetry Dashboard) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-3 relative overflow-hidden">
          <div
            ref={mapContainerRef}
            className="w-full h-[480px] sm:h-[560px] rounded-2xl z-10"
            style={{ background: '#e2e8f0' }}
          />

          {/* Floating map legend / status pill */}
          <div className="absolute top-6 left-6 z-20 glass-dark rounded-xl px-3.5 py-2 text-white shadow-xl flex items-center gap-3 border border-white/20">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <div className="text-left">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Tracking Vehicle</p>
              <p className="text-xs font-bold text-white">{telemetry?.busNumber || selectedBus?.busNumber || 'BUS-012'}</p>
            </div>
          </div>
        </div>

        {/* Telemetry & Stop Sequence Panel */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Telemetry Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400">Live Vehicle Telemetry</span>
                <h3 className="text-base font-bold text-white mt-0.5">{telemetry?.routeName || selectedBus?.routeName}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Active
              </span>
            </div>

            {/* Gauges grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Speed</span>
                <p className="text-xl font-black text-white mt-1">
                  {telemetry?.speedKmH || 38} <span className="text-xs font-normal text-slate-400">km/h</span>
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Occupancy</span>
                <p className="text-xl font-black text-emerald-400 mt-1">
                  {telemetry?.occupancy || 28} <span className="text-xs font-normal text-slate-400">/ {telemetry?.capacity || 45}</span>
                </p>
              </div>
            </div>

            {/* Next Stop Alert */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                Next Approaching Stop
              </span>
              <p className="text-sm font-bold text-white">
                {telemetry?.nextStop || 'Central Bus Terminal'}
              </p>
              <p className="text-[11px] text-slate-300">
                Estimated arrival: <strong className="text-emerald-400">~2 to 4 mins</strong>
              </p>
            </div>

            {/* Route progress */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Corridor Progress</span>
                <span className="text-white font-mono">{telemetry?.routeProgressPercent || 45}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${telemetry?.routeProgressPercent || 45}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Route Stops Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Corridor Stop Sequence</span>
              <span className="text-xs text-slate-400 font-normal">
                {telemetry?.stops?.length || 5} Stops
              </span>
            </h4>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {telemetry?.stops?.map((stop, i) => {
                const isNext = stop.name === telemetry?.nextStop;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition ${
                      isNext
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isNext ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate flex-1">{stop.name}</span>
                    {isNext && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        Next
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
