// Populates the database with sample buses, users, tickets and pricing so the app is
// usable immediately after setup. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Bus, Pricing, Ticket } = require('../src/models');
const { generateTicketToken } = require('../src/utils/qrcode');

async function seed() {
  console.log('Synchronizing database schema...');
  // Force sync resets tables cleanly for a fresh seed
  await sequelize.sync({ force: true });

  console.log('Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  const adminHash = await bcrypt.hash('admin123', salt);

  const riderUser = await User.create({
    id: '8be05e4f-b6ff-481b-8de2-e149bae4e142',
    name: 'Krish Kumar Mathuri',
    email: 'krishkumarmathuri@gmail.com',
    passwordHash,
    phone: '+91 98765 43210',
    role: 'rider',
  });

  const demoRider = await User.create({
    name: 'Alex Johnson',
    email: 'rider@citybus.com',
    passwordHash,
    phone: '+1 555-0192',
    role: 'rider',
  });

  const adminUser = await User.create({
    name: 'Transit Officer Sarah',
    email: 'admin@citybus.com',
    passwordHash: adminHash,
    phone: '+1 555-0199',
    role: 'admin',
  });

  console.log('Creating bus routes...');
  const buses = await Bus.bulkCreate([
    {
      routeName: 'Route 12: Downtown - University',
      busNumber: 'BUS-012',
      capacity: 45,
      currentLat: 12.9716,
      currentLng: 77.5946,
      status: 'active',
    },
    {
      routeName: 'Route 34: Airport Express',
      busNumber: 'BUS-034',
      capacity: 50,
      currentLat: 12.9500,
      currentLng: 77.6800,
      status: 'active',
    },
    {
      routeName: 'Route 7: Suburb Loop',
      busNumber: 'BUS-007',
      capacity: 35,
      currentLat: 13.0100,
      currentLng: 77.5600,
      status: 'active',
    },
    {
      routeName: 'Route 42: Coastal Rapid Transit',
      busNumber: 'BUS-042',
      capacity: 55,
      currentLat: 12.9350,
      currentLng: 77.6200,
      status: 'active',
    },
  ], { returning: true });

  console.log('Creating pricing rules...');
  await Pricing.bulkCreate([
    // System-wide default pricing (busId: null)
    { passType: 'single_ride', price: 2.50, busId: null },
    { passType: 'day_pass', price: 7.00, busId: null },
    { passType: 'weekly_pass', price: 30.00, busId: null },
    { passType: 'monthly_pass', price: 90.00, busId: null },

    // Airport Express costs more
    { passType: 'single_ride', price: 6.00, busId: buses[1].id },
    { passType: 'day_pass', price: 15.00, busId: buses[1].id },
    { passType: 'weekly_pass', price: 55.00, busId: buses[1].id },
    { passType: 'monthly_pass', price: 160.00, busId: buses[1].id },

    // Coastal Rapid
    { passType: 'single_ride', price: 3.50, busId: buses[3].id },
    { passType: 'day_pass', price: 9.50, busId: buses[3].id },
  ]);

  console.log('Creating sample passes for demonstration...');
  const now = new Date();
  
  // 1. Active Day Pass (valid for 24h)
  const dayUntil = new Date(now.getTime() + 24 * 3600 * 1000);
  const pass1 = await Ticket.create({
    userId: riderUser.id,
    busId: buses[1].id,
    passType: 'day_pass',
    priceCharged: 15.00,
    status: 'valid',
    validFrom: now,
    validUntil: dayUntil,
    qrToken: 'pending',
  });
  pass1.qrToken = generateTicketToken(pass1.id, dayUntil);
  await pass1.save();

  // 2. Active Monthly Pass (valid for 30 days)
  const monthUntil = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  const pass2 = await Ticket.create({
    userId: riderUser.id,
    busId: buses[0].id,
    passType: 'monthly_pass',
    priceCharged: 90.00,
    status: 'valid',
    validFrom: now,
    validUntil: monthUntil,
    qrToken: 'pending',
  });
  pass2.qrToken = generateTicketToken(pass2.id, monthUntil);
  await pass2.save();

  // 3. Expired Pass
  const expiredFrom = new Date(now.getTime() - 48 * 3600 * 1000);
  const expiredUntil = new Date(now.getTime() - 24 * 3600 * 1000);
  const pass3 = await Ticket.create({
    userId: riderUser.id,
    busId: buses[2].id,
    passType: 'single_ride',
    priceCharged: 2.50,
    status: 'expired',
    validFrom: expiredFrom,
    validUntil: expiredUntil,
    qrToken: 'pending',
  });
  pass3.qrToken = generateTicketToken(pass3.id, expiredUntil);
  await pass3.save();

  console.log('Database seeded successfully!');
  console.log('Demo Accounts:');
  console.log('  Rider: krishkumarmathuri@gmail.com / password123');
  console.log('  Rider 2: rider@citybus.com / password123');
  console.log('  Conductor/Admin: admin@citybus.com / admin123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
