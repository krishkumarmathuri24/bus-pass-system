import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

// Loads the Google Maps JS SDK once and resolves when it's ready.
function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function BusTracker() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    api.get('/buses').then((res) => {
      setBuses(res.data);
      if (res.data.length) setSelectedBusId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!apiKey) return; // no key configured - fall back to the plain list below
    loadGoogleMaps(apiKey).then(() => {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 12,
      });
    });
  }, [apiKey]);

  // Poll the bus's (dummy) live position every 5 seconds.
  useEffect(() => {
    if (!selectedBusId) return;
    let cancelled = false;

    async function poll() {
      const { data } = await api.get(`/buses/${selectedBusId}/location`);
      if (cancelled) return;

      if (mapInstance.current) {
        const pos = { lat: data.lat, lng: data.lng };
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({ position: pos, map: mapInstance.current });
        } else {
          markerRef.current.setPosition(pos);
        }
        mapInstance.current.panTo(pos);
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedBusId]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Bus tracker</h2>

      <select
        className="border rounded px-3 py-2 w-fit"
        value={selectedBusId}
        onChange={(e) => setSelectedBusId(e.target.value)}
      >
        {buses.map((b) => (
          <option key={b.id} value={b.id}>{b.routeName}</option>
        ))}
      </select>

      {apiKey ? (
        <div ref={mapRef} className="w-full h-96 rounded-xl shadow" />
      ) : (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4">
          Set REACT_APP_GOOGLE_MAPS_API_KEY in the frontend .env to see the live map.
          The backend is already returning demo GPS coordinates from
          <code className="mx-1">/buses/:id/location</code> — this page just needs a key to render them.
        </p>
      )}
    </div>
  );
}
