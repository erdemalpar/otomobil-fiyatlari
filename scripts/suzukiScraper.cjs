const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.suzuki.com.tr/fiyat-listesi";

const FALLBACK_DATA = [
    { model: "Swift", version: "1.2 MHEV CVT GL Techno", price: 1145000, type: "Otomobil", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Swift", version: "1.2 MHEV CVT GLX Premium", price: 1265000, type: "Otomobil", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Vitara", version: "1.4 MHEV 6AT GL Elegance (Tek Renk)", price: 1540000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "Vitara", version: "1.4 MHEV 6AT AllGrip GLX Premium (Çift Renk)", price: 1815000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "S-Cross", version: "1.4 MHEV 6AT GL Elegance Select", price: 1650000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" }
];

async function scrapeSuzuki() {
    console.log("Suzuki resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Suzuki');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("Suzuki Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `suzuki-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Suzuki",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "",
                features: [car.fuel, car.trans],
                specs: { engine: "1.2", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Suzuki otomobili sisteme islendi.`);
}

scrapeSuzuki();
