const express = require('express');
const { Bus, Pricing } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /buses - list all active routes, for the "Book Ticket" page
router.get('/', async (req, res) => {
  const buses = await Bus.findAll({ where: { status: 'active' } });
  res.json(buses);
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

// GET /buses/:id/location - dummy live GPS position, polled by the Bus Tracker page.
// In production this would be updated by a device on the bus (e.g. via MQTT/websocket)
// instead of being read straight from the DB row.
router.get('/:id/location', async (req, res) => {
  const bus = await Bus.findByPk(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  res.json({
    busId: bus.id,
    routeName: bus.routeName,
    lat: bus.currentLat,
    lng: bus.currentLng,
    status: bus.status,
    updatedAt: bus.updatedAt,
  });
});

// POST /buses - admin only: register a new bus/route
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { routeName, busNumber, capacity } = req.body;
  const bus = await Bus.create({ routeName, busNumber, capacity });
  res.status(201).json(bus);
});

module.exports = router;
