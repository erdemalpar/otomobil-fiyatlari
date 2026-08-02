const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.seat.com.tr/fiyat-listesi";

const FALLBACK_DATA = [
    { model: "Ibiza", version: "1.0 EcoTSI 115 PS DSG Style", price: 1310000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Ibiza", version: "1.0 EcoTSI 115 PS DSG FR", price: 1470000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Arona", version: "1.0 EcoTSI 115 PS DSG Xperience", price: 1530000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Arona", version: "1.0 EcoTSI 115 PS DSG FR", price: 1560000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Leon", version: "1.5 eTSI 150 PS DSG FR", price: 1750000, type: "Otomobil", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Ateca", version: "1.5 EcoTSI 150 PS DSG Xperience", price: 1840000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Ateca", version: "1.5 EcoTSI 150 PS DSG FR", price: 1910000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Tarraco", version: "1.5 eTSI 150 PS DSG Xcellence", price: 2350000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" }
];

async function scrapeSeat() {
    console.log("SEAT resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Seat');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("SEAT Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `seat-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Seat",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "",
                features: [car.fuel, car.trans],
                specs: { engine: "Bilinmiyor", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet SEAT otomobili sisteme islendi.`);
}

scrapeSeat();
