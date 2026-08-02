const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

const newVehicles = [
  // --- TOGG T10X (EKSİKLER) ---
  {
    id: "togg-t10x-v1-rwd-standart", brand: "Togg", model: "T10X", version: "V1 RWD Standart Menzil", type: "Elektrikli SUV",
    price_list: 1432600, price_campaign: 1432600,
    image_url: "",
    features: ["Elektrikli", "314 km Menzil", "218 BG", "Arkadan İtiş"],
    specs: { engine: "-", horsepower: "218 BG", fuel_type: "Elektrik", range: "314 km" }, package_features: [], prices_by_year: { "2026": 1432600 }
  },
  {
    id: "togg-t10x-v2-rwd-standart", brand: "Togg", model: "T10X", version: "V2 RWD Standart Menzil", type: "Elektrikli SUV",
    price_list: 1550000, price_campaign: 1550000,
    image_url: "",
    features: ["Elektrikli", "314 km Menzil", "218 BG", "Arkadan İtiş"],
    specs: { engine: "-", horsepower: "218 BG", fuel_type: "Elektrik", range: "314 km" }, package_features: [], prices_by_year: { "2026": 1550000 }
  },
  {
    id: "togg-t10x-v2-awd-uzun", brand: "Togg", model: "T10X", version: "V2 AWD Uzun Menzil Çift Motor", type: "Elektrikli SUV",
    price_list: 2190000, price_campaign: 2190000,
    image_url: "",
    features: ["Elektrikli", "468 km Menzil", "435 BG", "4x4"],
    specs: { engine: "-", horsepower: "435 BG", fuel_type: "Elektrik", range: "468 km" }, package_features: [], prices_by_year: { "2026": 2190000 }
  },
  
  // --- TESLA (EKSİKLER) ---
  {
    id: "tesla-modely-longrange", brand: "Tesla", model: "Model Y", version: "Long Range AWD", type: "Elektrikli SUV",
    price_list: 3081000, price_campaign: 3081000,
    image_url: "",
    features: ["Elektrikli", "533 km Menzil", "4x4", "Otopilot"],
    specs: { engine: "-", horsepower: "450 BG (Tahmini)", fuel_type: "Elektrik", range: "533 km" }, package_features: [], prices_by_year: { "2026": 3081000 }
  },
  {
    id: "tesla-modely-performance", brand: "Tesla", model: "Model Y", version: "Performance AWD", type: "Elektrikli SUV",
    price_list: 3334000, price_campaign: 3334000,
    image_url: "",
    features: ["Elektrikli", "514 km Menzil", "4x4", "3.7s 0-100"],
    specs: { engine: "-", horsepower: "534 BG (Tahmini)", fuel_type: "Elektrik", range: "514 km" }, package_features: [], prices_by_year: { "2026": 3334000 }
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
console.log(`Tamamlandı! ${added} adet yeni T10X ve Tesla varyasyonu veritabanına eklendi.`);
