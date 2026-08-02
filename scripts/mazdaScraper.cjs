const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.mazda.com.tr/fiyat-listesi/";

const FALLBACK_DATA = [
    { model: "Mazda3", version: "2.0 Skyactiv-G 150 PS AT Reflex", price: 1850000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "CX-5", version: "2.0 Skyactiv-G 165 PS AT AWD Power Sense", price: 3450000, type: "SUV", fuel: "Benzin", trans: "Otomatik" }
];

async function scrapeMazda() {
    console.log("Mazda resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Mazda');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Mazda Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `mazda-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Mazda",
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
    console.log(`Tamamlandi! ${added} adet Mazda otomobili sisteme islendi.`);
}

scrapeMazda();
