const express = require('express');
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /users/me - current user's profile
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PATCH /users/me - update profile (name/phone only; email/password have dedicated flows)
router.patch('/me', requireAuth, async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();

  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone });
});

module.exports = router;
