const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

const newVehicles = [
  // --- OMODA 7 ---
  {
    id: "omoda-7-16-tgdi-luxury", brand: "Omoda", model: "Omoda 7", version: "1.6 TGDI Luxury", type: "Otomobil (Benzin)",
    price_list: 1650000, price_campaign: 1650000,
    image_url: "", // Temsili Omoda
    features: ["Benzin", "Otomatik", "197 BG", "Önden Çekiş"],
    specs: { engine: "1598 cc", horsepower: "197 BG", fuel_type: "Benzin", transmission: "Otomatik" }, package_features: [], prices_by_year: { "2026": 1650000 }
  },
  
  // --- JAECOO 7 EVOLVE (4x4) ---
  {
    id: "jaecoo-j7-evolve-4x4", brand: "Jaecoo", model: "J7", version: "1.6 TGDI Evolve (4x4)", type: "Otomobil (Benzin)",
    price_list: 2150000, price_campaign: 2150000,
    image_url: "",
    features: ["Benzin", "Otomatik", "145 BG", "4x4", "Off-Road Modu"],
    specs: { engine: "1598 cc", horsepower: "145 BG", fuel_type: "Benzin", transmission: "Otomatik" }, package_features: [], prices_by_year: { "2026": 2150000 }
  },
  
  // --- JAECOO 7 EVOLVE (4x2) ---
  {
    id: "jaecoo-j7-evolve-4x2", brand: "Jaecoo", model: "J7", version: "1.6 TGDI Evolve (4x2)", type: "Otomobil (Benzin)",
    price_list: 1990000, price_campaign: 1990000,
    image_url: "",
    features: ["Benzin", "Otomatik", "145 BG", "Önden Çekiş"],
    specs: { engine: "1598 cc", horsepower: "145 BG", fuel_type: "Benzin", transmission: "Otomatik" }, package_features: [], prices_by_year: { "2026": 1990000 }
  }
];

let added = 0;
newVehicles.forEach(nv => {
  const exists = db.vehicles.some(v => v.id === nv.id || (v.brand === nv.brand && v.model === nv.model && v.version === nv.version));
  if (!exists) {
    db.vehicles.push(nv);
    added++;
  }
});

db.lastUpdated = new Date().toISOString();
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
console.log(`Tamamlandi! ${added} adet Omoda 7 ve Jaecoo Evolve modelleri eklendi.`);
