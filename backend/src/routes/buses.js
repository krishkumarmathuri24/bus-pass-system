const express = require('express');
const { Bus, Pricing } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const ROUTE_DATA = {
  'BUS-012': {
    color: '#2563eb',
    frequency: 'Every 8 mins',
    operatingHours: '05:30 AM - 11:30 PM',
    stops: [
      { name: 'Central Bus Terminal', lat: 12.9716, lng: 77.5946 },
      { name: 'City Hall Plaza', lat: 12.9760, lng: 77.5990 },
      { name: 'Metro Central Station', lat: 12.9810, lng: 77.6045 },
      { name: 'Tech Innovation Hub', lat: 12.9860, lng: 77.6110 },
      { name: 'University Main Gate', lat: 12.9910, lng: 77.6175 },
      { name: 'Science Complex End', lat: 12.9960, lng: 77.6240 },
    ],
  },
  'BUS-034': {
    color: '#059669',
    frequency: 'Every 15 mins',
    operatingHours: '24 Hours / 7 Days',
    stops: [
      { name: 'Downtown Transit Center', lat: 12.9500, lng: 77.6800 },
      { name: 'East Business District', lat: 12.9620, lng: 77.6950 },
      { name: 'Expressway Flyover', lat: 12.9750, lng: 77.7120 },
      { name: 'Cargo City Station', lat: 12.9880, lng: 77.7280 },
      { name: 'Airport Terminal 1', lat: 12.9980, lng: 77.7400 },
      { name: 'Airport Terminal 2', lat: 13.0080, lng: 77.7520 },
    ],
  },
  'BUS-007': {
    color: '#d97706',
    frequency: 'Every 12 mins',
    operatingHours: '06:00 AM - 10:30 PM',
    stops: [
      { name: 'Green Valley Hub', lat: 13.0100, lng: 77.5600 },
      { name: 'North Ridge Gardens', lat: 13.0200, lng: 77.5710 },
      { name: 'Riverside Promenade', lat: 13.0280, lng: 77.5840 },
      { name: 'North Square Galleria', lat: 13.0360, lng: 77.5970 },
      { name: 'Civic Community Center', lat: 13.0440, lng: 77.6080 },
    ],
  },
  'BUS-042': {
    color: '#7c3aed',
    frequency: 'Every 10 mins',
    operatingHours: '06:00 AM - 11:00 PM',
    stops: [
      { name: 'Harbor Marina Point', lat: 12.9350, lng: 77.6200 },
      { name: 'Ocean View Boardwalk', lat: 12.9270, lng: 77.6330 },
      { name: 'Bayview Tech Sector', lat: 12.9190, lng: 77.6460 },
      { name: 'South Beach Pier', lat: 12.9120, lng: 77.6590 },
      { name: 'Sunset Lighthouse Plaza', lat: 12.9050, lng: 77.6710 },
    ],
  },
};

// Helper: interpolate coordinates along stops over a repeating time cycle
function calculateMovingGps(stops, durationSec = 120) {
  if (!stops || stops.length < 2) {
    return { lat: stops?.[0]?.lat || 12.9716, lng: stops?.[0]?.lng || 77.5946, nextStop: stops?.[0]?.name || 'Central', stopIndex: 0, progress: 0 };
  }
  const totalSegments = stops.length - 1;
  const cycleTime = (Date.now() / 1000) % durationSec;
  const tNorm = cycleTime / durationSec; // 0 to 1
  
  // Ping-pong between start and end
  const pingPong = tNorm < 0.5 ? tNorm * 2 : (1 - tNorm) * 2;
  const segmentFloat = pingPong * totalSegments;
  const segIndex = Math.min(Math.floor(segmentFloat), totalSegments - 1);
  const segProgress = segmentFloat - segIndex;

  const startStop = stops[segIndex];
  const endStop = stops[segIndex + 1];

  const lat = Number((startStop.lat + (endStop.lat - startStop.lat) * segProgress).toFixed(6));
  const lng = Number((startStop.lng + (endStop.lng - startStop.lng) * segProgress).toFixed(6));
  const nextStop = segProgress > 0.85 ? stops[Math.min(segIndex + 2, stops.length - 1)].name : endStop.name;

  return { lat, lng, nextStop, stopIndex: segIndex, progress: Math.round(pingPong * 100) };
}

// GET /buses - list all active routes with schedule & stop metadata
router.get('/', async (req, res) => {
  const buses = await Bus.findAll({ where: { status: 'active' } });
  const enriched = buses.map((b) => {
    const meta = ROUTE_DATA[b.busNumber] || {};
    return {
      ...b.toJSON(),
      frequency: meta.frequency || 'Every 10 mins',
      operatingHours: meta.operatingHours || '06:00 AM - 11:00 PM',
      color: meta.color || '#2563eb',
      stopsCount: meta.stops?.length || 5,
      stops: meta.stops || [],
    };
  });
  res.json(enriched);
});

// GET /buses/:id/pricing - active pricing options for a route
router.get('/:id/pricing', async (req, res) => {
  const pricing = await Pricing.findAll({
    where: { busId: req.params.id, active: true },
  });
  // Fall back to system-wide pricing (busId null) if the route has none of its own
  if (pricing.length === 0) {
    const fallback = await Pricing.findAll({ where: { busId: null, active: true } });
    return res.json(fallback);
  }
  res.json(pricing);
});

// GET /buses/:id/location - dynamic live GPS position and telemetry
router.get('/:id/location', async (req, res) => {
  const bus = await Bus.findByPk(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const meta = ROUTE_DATA[bus.busNumber] || {
    stops: [
      { name: 'Central Stop', lat: bus.currentLat || 12.9716, lng: bus.currentLng || 77.5946 },
      { name: 'Terminal Point', lat: (bus.currentLat || 12.9716) + 0.02, lng: (bus.currentLng || 77.5946) + 0.02 },
    ],
  };

  const gps = calculateMovingGps(meta.stops, 150);
  const currentSpeed = Math.floor(32 + Math.sin(Date.now() / 15000) * 12);
  const passengerCount = Math.min(bus.capacity, Math.floor(bus.capacity * 0.65 + Math.cos(Date.now() / 25000) * 8));

  res.json({
    busId: bus.id,
    busNumber: bus.busNumber,
    routeName: bus.routeName,
    lat: gps.lat,
    lng: gps.lng,
    speedKmH: currentSpeed,
    occupancy: passengerCount,
    capacity: bus.capacity,
    nextStop: gps.nextStop,
    routeProgressPercent: gps.progress,
    status: bus.status,
    frequency: meta.frequency,
    stops: meta.stops,
    updatedAt: new Date().toISOString(),
  });
});

// POST /buses - admin only: register a new bus/route
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { routeName, busNumber, capacity } = req.body;
  const bus = await Bus.create({ routeName, busNumber, capacity });
  res.status(201).json(bus);
});

module.exports = router;
