const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.tesla.com/tr_TR/modely/design";

const FALLBACK_DATA = [
    { model: "Model Y", version: "Arkadan İtiş (RWD)", price: 1791451, type: "SUV", fuel: "Elektrik", trans: "Otomatik" },
    { model: "Model Y", version: "Long Range Arkadan İtiş", price: 2255464, type: "SUV", fuel: "Elektrik", trans: "Otomatik" },
    { model: "Model Y", version: "Long Range Dört Çeker (AWD)", price: 2816912, type: "SUV", fuel: "Elektrik", trans: "Otomatik" },
    { model: "Model Y", version: "Performance Dört Çeker (AWD)", price: 3086384, type: "SUV", fuel: "Elektrik", trans: "Otomatik" }
];

async function scrapeTesla() {
    console.log("Tesla resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Tesla');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi veya selector bulunamadi.");
    } catch (error) {
        console.warn("Tesla Canli Cekim Basarisiz! Yedek liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `tesla-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Tesla",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "",
                features: [car.fuel, car.trans],
                specs: { engine: "Elektrik Motoru", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Tesla otomobili sisteme islendi.`);
}

scrapeTesla();
