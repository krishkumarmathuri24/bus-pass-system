
// Populates the database with sample buses and pricing so the app is
// usable immediately after setup. Run with: npm run seed
require('dotenv').config();
const { sequelize, Bus, Pricing } = require('../src/models');

async function seed() {
  await sequelize.sync();

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
  ], { returning: true });

  // System-wide default pricing (busId: null) applies to any route without
  // its own override - e.g. Route 7 below intentionally has none.
  await Pricing.bulkCreate([
    { passType: 'single_ride', price: 2.50, busId: null },
    { passType: 'day_pass', price: 7.00, busId: null },
    { passType: 'weekly_pass', price: 30.00, busId: null },
    { passType: 'monthly_pass', price: 90.00, busId: null },

    // Airport Express costs more than the default fares.
    { passType: 'single_ride', price: 6.00, busId: buses[1].id },
    { passType: 'day_pass', price: 15.00, busId: buses[1].id },
  ]);

  console.log(`Seeded ${buses.length} buses and default + route-specific pricing.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
