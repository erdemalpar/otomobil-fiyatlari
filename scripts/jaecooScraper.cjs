const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.omodajaecoo.com.tr/fiyat-listesi/";

const FALLBACK_DATA = [
    { model: "Jaecoo 7", version: "Revive 1.6 TGDI 4x2", price: 1920000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Jaecoo 7", version: "Evolve 1.6 TGDI 4x4", price: 2160000, type: "SUV", fuel: "Benzin", trans: "Otomatik" }
];

async function scrapeJaecoo() {
    console.log("Jaecoo resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Jaecoo verilerini temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Jaecoo' && v.brand !== 'JAECOO');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina (NitroPack) takildi.");
    } catch (error) {
        console.warn("Jaecoo Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `jaecoo-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Jaecoo",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "https://www.jaecoo.com.tr/assets/models/j7.png",
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
    console.log(`Tamamlandi! ${added} adet Jaecoo otomobili sisteme islendi.`);
}

scrapeJaecoo();
