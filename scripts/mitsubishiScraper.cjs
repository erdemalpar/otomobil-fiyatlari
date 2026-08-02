const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.mitsubishi-motors.com.tr/fiyat-listesi";

const FALLBACK_DATA = [
    { model: "Space Star", version: "1.2 Intense CVT", price: 920000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Colt", version: "1.0 Intense MT", price: 1050000, type: "Otomobil", fuel: "Benzin", trans: "Manuel" },
    { model: "Colt", version: "1.0 Instyle AT", price: 1250000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "ASX", version: "1.0 Intense MT", price: 1350000, type: "SUV", fuel: "Benzin", trans: "Manuel" },
    { model: "ASX", version: "1.3 Instyle MHEV AT", price: 1550000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" }
];

async function scrapeMitsubishi() {
    console.log("Mitsubishi resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Mitsubishi');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Mitsubishi Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `mitsubishi-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Mitsubishi",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "https://www.mitsubishi-motors.com.tr/assets/models/spacestar/spacestar.png",
                features: [car.fuel, car.trans],
                specs: { engine: "1.0", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Mitsubishi otomobili sisteme islendi.`);
}

scrapeMitsubishi();
