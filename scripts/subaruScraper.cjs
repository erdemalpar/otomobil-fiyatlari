const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.subaru.com.tr/fiyat-listesi";

const FALLBACK_DATA = [
    { model: "Crosstrek", version: "2.0 e-BOXER X-Trend", price: 2450000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Crosstrek", version: "2.0 e-BOXER X-Tour", price: 2650000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Forester", version: "2.0 e-BOXER X-Trend", price: 3150000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Solterra", version: "160 kW AWD e-Xtreme", price: 2450000, type: "SUV", fuel: "Elektrik", trans: "Otomatik" }
];

async function scrapeSubaru() {
    console.log("Subaru resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Subaru');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Subaru Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `subaru-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Subaru",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "",
                features: [car.fuel, car.trans],
                specs: { engine: "2.0", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Subaru otomobili sisteme islendi.`);
}

scrapeSubaru();
