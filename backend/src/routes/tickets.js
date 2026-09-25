const express = require('express');
const { Ticket, Pricing, Bus } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { generateTicketToken, generateQrImage, verifyTicketToken } = require('../utils/qrcode');

const router = express.Router();

// Given a pass type, compute the validity window from "now".
function computeValidity(passType) {
  const from = new Date();
  const until = new Date(from);
  switch (passType) {
    case 'single_ride': until.setHours(until.getHours() + 2); break;
    case 'day_pass': until.setDate(until.getDate() + 1); break;
    case 'weekly_pass': until.setDate(until.getDate() + 7); break;
    case 'monthly_pass': until.setMonth(until.getMonth() + 1); break;
    default: until.setHours(until.getHours() + 2);
  }
  return { from, until };
}

// POST /tickets/book
// The client sends only busId + passType - never a price. The price is
// always looked up server-side from the Pricing table, which is what
// prevents the "incorrect pricing" tampering scenario from Task 3.
router.post('/book', requireAuth, async (req, res) => {
  try {
    const { busId, passType } = req.body;
    if (!busId || !passType) {
      return res.status(400).json({ error: 'busId and passType are required' });
    }

    const bus = await Bus.findByPk(busId);
    if (!bus) return res.status(404).json({ error: 'Bus/route not found' });

    // Look up route-specific pricing, falling back to system-wide pricing.
    let pricing = await Pricing.findOne({ where: { busId, passType, active: true } });
    if (!pricing) {
      pricing = await Pricing.findOne({ where: { busId: null, passType, active: true } });
    }
    if (!pricing) return res.status(400).json({ error: 'No active pricing for this pass type' });

    const { from, until } = computeValidity(passType);

    // Create the ticket first (without qrToken) so we have a real ticket ID
    // to embed in the signed token.
    const ticket = await Ticket.create({
      userId: req.user.id,
      busId,
      passType,
      priceCharged: pricing.price,
      qrToken: 'pending',
      validFrom: from,
      validUntil: until,
    });

    const qrToken = generateTicketToken(ticket.id, until);
    ticket.qrToken = qrToken;
    await ticket.save();

    const qrImage = await generateQrImage(qrToken);

    res.status(201).json({
      ticket: {
        id: ticket.id,
        busId: ticket.busId,
        routeName: bus.routeName,
        passType: ticket.passType,
        priceCharged: ticket.priceCharged,
        status: ticket.status,
        validFrom: ticket.validFrom,
        validUntil: ticket.validUntil,
      },
      qrImage, // base64 PNG the frontend renders directly
    });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});

// GET /tickets/mine - "My Passes" page
router.get('/mine', requireAuth, async (req, res) => {
  const tickets = await Ticket.findAll({
    where: { userId: req.user.id },
    include: [{ model: Bus, attributes: ['routeName', 'busNumber'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(tickets);
});

// GET /tickets/:id/qr - re-fetch the QR image for an existing ticket
router.get('/:id/qr', requireAuth, async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket || ticket.userId !== req.user.id) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  const qrImage = await generateQrImage(ticket.qrToken);
  res.json({ qrImage });
});

// POST /tickets/validate - used by a conductor/scanner app (admin only).
// Verifies the signed token AND the live DB status, then marks single-ride
// tickets as used so the same QR can't be replayed.
router.post('/validate', requireAuth, requireAdmin, async (req, res) => {
  const { qrToken } = req.body;
  const decoded = verifyTicketToken(qrToken);
  if (!decoded) {
    return res.status(400).json({ valid: false, reason: 'Invalid, tampered, or expired QR code' });
  }

  const ticket = await Ticket.findByPk(decoded.ticketId);
  if (!ticket) return res.status(404).json({ valid: false, reason: 'Ticket not found' });
  if (ticket.status !== 'valid') {
    return res.status(409).json({ valid: false, reason: `Ticket already ${ticket.status}` });
  }
  if (new Date(ticket.validUntil) < new Date()) {
    ticket.status = 'expired';
    await ticket.save();
    return res.status(409).json({ valid: false, reason: 'Ticket expired' });
  }

  if (ticket.passType === 'single_ride') {
    ticket.status = 'used';
    await ticket.save();
  }

  res.json({ valid: true, ticket });
});

module.exports = router;
