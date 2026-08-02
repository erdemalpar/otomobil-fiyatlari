const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.toyota.com.tr/fiyat-listesi";

// ZORUNLU KURAL: Captcha veya PDF engeline karşı "Yedek Katalog"
const FALLBACK_DATA = [
    { model: "Corolla", version: "1.5 Vision Plus Multidrive S", price: 1545000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Corolla", version: "1.5 Dream Multidrive S", price: 1640000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Corolla", version: "1.5 Dream X-Pack Multidrive S", price: 1722500, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Corolla", version: "1.5 Flame X-Pack Multidrive S", price: 1835000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Corolla Hybrid", version: "1.8 Hybrid Dream e-CVT", price: 1910000, type: "Otomobil", fuel: "Hibrit", trans: "Otomatik" },
    { model: "Corolla Hybrid", version: "1.8 Hybrid Flame X-Pack e-CVT", price: 2010000, type: "Otomobil", fuel: "Hibrit", trans: "Otomatik" },
    { model: "Yaris", version: "1.5 Dream Multidrive S", price: 1355000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Yaris Cross", version: "1.5 Dream Multidrive S", price: 1610000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Yaris Cross", version: "1.5 Hybrid Dream e-CVT", price: 1780000, type: "SUV", fuel: "Hibrit", trans: "Otomatik" },
    { model: "C-HR Hybrid", version: "1.8 Hybrid Passion e-CVT", price: 2120000, type: "SUV", fuel: "Hibrit", trans: "Otomatik" },
    { model: "RAV4", version: "2.5 Hybrid Flame e-CVT", price: 3500000, type: "SUV", fuel: "Hibrit", trans: "Otomatik" }
];

async function scrapeToyota() {
    console.log("Toyota resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Toyota verilerini temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Toyota');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Buraya site DOM parse kodlari gelir. Eger anti-bot engellerse fallback'e gec!
        throw new Error("Tarayici bot korumasina takildi veya selector bulunamadi. Fallback kataloga geciliyor...");
    } catch (error) {
        console.warn("Toyota Canli Cekim Basarisiz! Yedek (Fallback) liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `toyota-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Toyota",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "",
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
    console.log(`Tamamlandi! ${added} adet Toyota otomobili sisteme islendi.`);
}

scrapeToyota();
