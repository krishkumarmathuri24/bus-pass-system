const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const busRoutes = require('./routes/buses');
const ticketRoutes = require('./routes/tickets');

const app = express();

// --- Security & scaling-friendly middleware ---
app.use(helmet()); // sensible security headers
app.use(cors());
app.use(express.json());

// Basic rate limiting so a traffic spike (or abuse) can't take down a single
// instance before the auto-scaler has a chance to add more. In production
// this is normally paired with a queue (e.g. SQS/RabbitMQ) in front of the
// booking endpoint for genuinely bursty load.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 requests/minute/IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// The app server is stateless (no session/in-memory data) - this is what
// lets any number of identical instances sit behind a load balancer and
// share traffic, which is the basis of the auto-scaling requirement.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', instance: process.env.HOSTNAME || 'local', uptime: process.uptime() });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/buses', busRoutes);
app.use('/tickets', ticketRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    // In production, prefer migrations over sync({ alter: true }).
    await sequelize.sync();
    console.log('Database connected and synced.');

    app.listen(PORT, () => {
      console.log(`Bus pass API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
