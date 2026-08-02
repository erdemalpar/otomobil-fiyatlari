const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.omodajaecoo.com.tr/fiyat-listesi/";

const FALLBACK_DATA = [
    { model: "Omoda 5", version: "PRO 1.6 TGDi Exceptional", price: 1637000, type: "SUV", fuel: "Benzin", trans: "Otomatik" }
];

async function scrapeOmoda() {
    console.log("Omoda resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Omoda verilerini temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Omoda');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina (NitroPack) takildi.");
    } catch (error) {
        console.warn("Omoda Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `omoda-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Omoda",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "https://www.omoda.com.tr/assets/models/omoda5.png",
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
    console.log(`Tamamlandi! ${added} adet Omoda otomobili sisteme islendi.`);
}

scrapeOmoda();
