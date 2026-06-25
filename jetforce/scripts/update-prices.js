const mongoose = require('mongoose');
require('dotenv').config();

async function updatePricing() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const col = db.collection('pricemaps');

  // Each vehicle gets a unique multiplier so prices differ
  const updates = [
    { vehicleType: 'Volvo', multiplier: 0.85 },
    { vehicleType: 'Black Suburban 2020', multiplier: 0.90 },
    { vehicleType: 'Black Suburban 2024', multiplier: 1.00 },
    { vehicleType: 'Black Suburban 2026', multiplier: 1.15 },
    { vehicleType: 'Black Chevy Tahoe 2024', multiplier: 1.05 },
    { vehicleType: 'Chevrolet Suburban 2021', multiplier: 0.95 },
    { vehicleType: 'Chevrolet Suburban Rst', multiplier: 1.10 },
    { vehicleType: 'Black Chevrolet Suburban High', multiplier: 1.25 },
  ];

  for (const u of updates) {
    const doc = await col.findOne({ vehicleType: u.vehicleType });
    if (!doc) {
      console.log('Not found:', u.vehicleType);
      continue;
    }
    const newPricing = doc.pricing.map(p => ({
      ...p,
      price: Math.round(p.price * u.multiplier * 100) / 100,
    }));
    await col.updateOne(
      { vehicleType: u.vehicleType },
      { $set: { pricing: newPricing } }
    );
    console.log('Updated', u.vehicleType, '-> prices:', newPricing.map(p => p.price).join(', '));
  }

  console.log('\n✅ All vehicle prices differentiated!');
  process.exit(0);
}

updatePricing().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
