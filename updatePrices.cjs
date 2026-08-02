const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'data', 'vehicles.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.vehicles.forEach(vehicle => {
  const currentPrice = vehicle.price_list;
  
  // Randomly decide if 2025 and 2027 exists
  const has2025 = Math.random() > 0.1; // 90% chance
  const has2027 = Math.random() > 0.3; // 70% chance

  vehicle.prices_by_year = {};
  
  if (has2025) {
    // 2025 price is about 15-20% cheaper
    const discountFactor = 0.80 + (Math.random() * 0.05);
    vehicle.prices_by_year["2025"] = Math.round((currentPrice * discountFactor) / 1000) * 1000;
  }
  
  // 2026 is current year
  vehicle.prices_by_year["2026"] = currentPrice;
  
  if (has2027) {
    // 2027 price is about 25-35% more expensive (inflation simulation)
    const inflationFactor = 1.25 + (Math.random() * 0.10);
    vehicle.prices_by_year["2027"] = Math.round((currentPrice * inflationFactor) / 1000) * 1000;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Prices by year added to all vehicles.");
