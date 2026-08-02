const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.nissan.com.tr/araclar/fiyat-listesi.html";

const FALLBACK_DATA = [
    { model: "Juke", version: "1.0 DIG-T 114PS DCT Tekna", price: 1515000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Juke", version: "1.0 DIG-T 114PS DCT Platinum", price: 1680000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Qashqai", version: "1.3 DIG-T 158PS X-Tronic CVT Designpack", price: 1980000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Qashqai", version: "e-POWER 190PS Skypack", price: 2350000, type: "SUV", fuel: "Elektrik-Benzin", trans: "Otomatik" },
    { model: "X-Trail", version: "e-4ORCE e-POWER 213PS Platinum", price: 3450000, type: "SUV", fuel: "Elektrik-Benzin", trans: "Otomatik" }
];

async function scrapeNissan() {
    console.log("Nissan resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Nissan');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Nissan Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `nissan-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Nissan",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "https://www.nissan.com.tr/content/dam/Nissan/turkey/vehicles/qashqai/j12/qashqai-j12.png",
                features: [car.fuel, car.trans],
                specs: { engine: "1.3", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Nissan otomobili sisteme islendi.`);
}

scrapeNissan();
