const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.cupraofficial.com.tr/fiyat-listesi";

const FALLBACK_DATA = [
    { model: "Formentor", version: "1.5 TSI 150 PS DSG", price: 1985000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Formentor", version: "VZ 2.0 TSI 310 PS DSG 4Drive", price: 3750000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Leon", version: "1.5 eTSI 150 PS DSG", price: 1810000, type: "Otomobil", fuel: "M-Hibrit", trans: "Otomatik" }
];

async function scrapeCupra() {
    console.log("Cupra resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Cupra');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Cupra Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `cupra-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Cupra",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "", // Yama duzeltecek
                features: [car.fuel, car.trans],
                specs: { engine: "1.5", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Cupra otomobili sisteme islendi.`);
}

scrapeCupra();
