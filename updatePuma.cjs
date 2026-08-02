const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'data', 'vehicles.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Eski Puma'ları filtrele (Sil)
db.vehicles = db.vehicles.filter(v => !(v.brand === 'Ford' && v.model.includes('Puma')));

// Yeni Puma'ları (Titanium ve ST-Line X) ekle
const newPumas = [
    {
        id: "ford-puma-titanium",
        brand: "Ford",
        model: "Puma",
        version: "Titanium",
        type: "SUV",
        features: ["Benzin/Hibrit", "Otomatik", "1.0L EcoBoost 125PS"],
        prices_by_year: { 
            "2025": 1897100, 
            "2026": 2238900 
        },
        // Fiyat tablolarında default price_campaign falan varsa bozulmasın diye ekleyelim
        price_list: 2238900, 
        price_campaign: 2238900,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/1999_Ford_Puma_16_1.7.jpg/960px-1999_Ford_Puma_16_1.7.jpg",
        specs: { horsepower: "125", acceleration: "9.8", range: "0", fuel_consumption: "5.4" },
        package_features: ["7 İleri Otomatik", "Titanium Donanım"]
    },
    {
        id: "ford-puma-st-line-x",
        brand: "Ford",
        model: "Puma",
        version: "ST-Line X",
        type: "SUV",
        features: ["Benzin/Hibrit", "Otomatik", "1.0L EcoBoost 155PS"],
        prices_by_year: { 
            "2025": 2138700, 
            "2026": 2615600 
        },
        price_list: 2615600,
        price_campaign: 2615600,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/1999_Ford_Puma_16_1.7.jpg/960px-1999_Ford_Puma_16_1.7.jpg",
        specs: { horsepower: "155", acceleration: "9.0", range: "0", fuel_consumption: "5.5" },
        package_features: ["7 İleri Otomatik", "ST-Line X Donanım"]
    }
];

db.vehicles = [...db.vehicles, ...newPumas];
db.lastUpdated = new Date().toISOString();
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log("Ford Puma verileri başarıyla 2025/2026 yapısına göre güncellendi.");
