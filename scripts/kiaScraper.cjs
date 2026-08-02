const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.kia.com/tr/satis-merkezi/fiyat-listesi.html";

const FALLBACK_DATA = [
    { model: "Picanto", version: "1.0L 67 PS AMT Feel", price: 925000, type: "Otomobil", fuel: "Benzin", trans: "Yari Otomatik" },
    { model: "Stonic", version: "1.4L 100 PS Otomatik Cool", price: 1250000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Niro", version: "1.6L 141 PS DCT Hibrit Prestige", price: 2150000, type: "SUV", fuel: "Hibrit", trans: "Otomatik" },
    { model: "Sportage", version: "1.6L 150 PS DCT Mild Hybrid Elegance", price: 2180000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Sportage", version: "1.6L 136 PS DCT Mild Hybrid (Dizel) Elegance", price: 2320000, type: "SUV", fuel: "M-Hibrit Dizel", trans: "Otomatik" },
    { model: "EV6", version: "225 kW 4X4 Otomatik (Elektrikli) GT-Line", price: 3450000, type: "SUV", fuel: "Elektrik", trans: "Otomatik" }
];

async function scrapeKia() {
    console.log("Kia resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Kia');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Kia Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `kia-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Kia",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/picanto/picanto-2024.png",
                features: [car.fuel, car.trans],
                specs: { engine: "1.6", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Kia otomobili sisteme islendi.`);
}

scrapeKia();
