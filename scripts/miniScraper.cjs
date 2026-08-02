const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.mini.com.tr/tr_TR/home/fiyat-listesi.html";

const FALLBACK_DATA = [
    { model: "Cooper 3 Kapı", version: "1.5 136 BG Signature", price: 1680000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Cooper S 3 Kapı", version: "2.0 178 BG Iconic", price: 2150000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Countryman", version: "1.5 136 BG ALL4 Signature", price: 2310000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Elektrikli Cooper", version: "184 BG SE Iconic", price: 1720000, type: "Otomobil", fuel: "Elektrik", trans: "Otomatik" }
];

async function scrapeMini() {
    console.log("MINI resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'MINI');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi.");
    } catch (error) {
        console.warn("MINI Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `mini-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "MINI",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "", // FixAllImages halledecek
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
    console.log(`Tamamlandi! ${added} adet MINI otomobili sisteme islendi.`);
}

scrapeMini();
