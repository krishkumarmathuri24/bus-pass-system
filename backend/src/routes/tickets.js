const express = require('express');
const { Ticket, Pricing, Bus, User } = require('../models');
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
router.post('/book', requireAuth, async (req, res) => {
  try {
    const { busId, passType, paymentMethod } = req.body;
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
    const ticket = await Ticket.create({
      userId: req.user.id,
      busId,
      passType,
      priceCharged: pricing.price,
      qrToken: 'pending',
      validFrom: from,
      validUntil: until,
      status: 'valid',
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
        busNumber: bus.busNumber,
        passType: ticket.passType,
        priceCharged: ticket.priceCharged,
        status: ticket.status,
        validFrom: ticket.validFrom,
        validUntil: ticket.validUntil,
        paymentMethod: paymentMethod || 'Card/Online',
      },
      qrImage,
      qrToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});

// GET /tickets/mine - "My Passes" page with auto-expiration detection
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id },
      include: [{ model: Bus, attributes: ['routeName', 'busNumber', 'capacity'] }],
      order: [['createdAt', 'DESC']],
    });

    const now = new Date();
    // Auto-mark expired tickets in response and DB
    const processed = await Promise.all(
      tickets.map(async (t) => {
        if (t.status === 'valid' && new Date(t.validUntil) < now) {
          t.status = 'expired';
          await t.save().catch(() => {});
        }
        return t;
      })
    );

    res.json(processed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets', details: err.message });
  }
});

// GET /tickets/:id/qr - re-fetch the QR image for an existing ticket
router.get('/:id/qr', requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket || ticket.userId !== req.user.id) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const qrImage = await generateQrImage(ticket.qrToken);
    res.json({ qrImage, qrToken: ticket.qrToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR', details: err.message });
  }
});

// GET /tickets/verify/:id - public/conductor verification check
router.get('/verify/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Bus, attributes: ['routeName', 'busNumber'] },
        { model: User, attributes: ['name', 'email'] },
      ],
    });
    if (!ticket) {
      return res.status(404).json({ valid: false, reason: 'Ticket not found in system' });
    }

    const now = new Date();
    let effectiveStatus = ticket.status;
    if (effectiveStatus === 'valid' && new Date(ticket.validUntil) < now) {
      effectiveStatus = 'expired';
      ticket.status = 'expired';
      await ticket.save().catch(() => {});
    }

    const isValid = effectiveStatus === 'valid';

    res.json({
      valid: isValid,
      status: effectiveStatus,
      ticket: {
        id: ticket.id,
        routeName: ticket.Bus?.routeName || 'City Transit Route',
        busNumber: ticket.Bus?.busNumber || 'N/A',
        passType: ticket.passType,
        priceCharged: ticket.priceCharged,
        passengerName: ticket.User?.name || 'Rider',
        validFrom: ticket.validFrom,
        validUntil: ticket.validUntil,
        status: effectiveStatus,
      },
      reason: isValid ? 'Pass is active and verified' : `Pass is ${effectiveStatus}`,
    });
  } catch (err) {
    res.status(500).json({ valid: false, reason: 'Verification error', details: err.message });
  }
});

// POST /tickets/validate - used by conductor/scanner app
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { qrToken, ticketId } = req.body;
    let targetTicketId = ticketId;

    if (qrToken) {
      const decoded = verifyTicketToken(qrToken);
      if (!decoded) {
        return res.status(400).json({ valid: false, reason: 'Invalid, tampered, or expired QR code' });
      }
      targetTicketId = decoded.ticketId;
    }

    if (!targetTicketId) {
      return res.status(400).json({ valid: false, reason: 'Provide either qrToken or ticketId' });
    }

    const ticket = await Ticket.findByPk(targetTicketId, {
      include: [
        { model: Bus, attributes: ['routeName', 'busNumber'] },
        { model: User, attributes: ['name', 'email'] },
      ],
    });

    if (!ticket) return res.status(404).json({ valid: false, reason: 'Ticket not found' });

    const now = new Date();
    if (new Date(ticket.validUntil) < now) {
      ticket.status = 'expired';
      await ticket.save();
      return res.status(409).json({ valid: false, reason: 'Ticket expired', ticket });
    }

    if (ticket.status !== 'valid') {
      return res.status(409).json({ valid: false, reason: `Ticket already ${ticket.status}`, ticket });
    }

    // If single ride, conductor marks it as used
    if (ticket.passType === 'single_ride') {
      ticket.status = 'used';
      await ticket.save();
    }

    res.json({
      valid: true,
      reason: 'Pass successfully verified and approved',
      ticket,
    });
  } catch (err) {
    res.status(500).json({ valid: false, reason: 'Validation error', details: err.message });
  }
});

module.exports = router;
