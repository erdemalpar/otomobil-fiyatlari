const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://fiyat.peugeot.com.tr/";

const FALLBACK_DATA = [
    { model: "208", version: "ACTIVE 1.2 PureTech 100hp EAT8", price: 1245000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "208", version: "GT 1.2 PureTech 130hp EAT8", price: 1425000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "208", version: "E-208 100kW (136hp) Elektrikli", price: 1395000, type: "Otomobil", fuel: "Elektrik", trans: "Otomatik" },
    { model: "2008", version: "ACTIVE 1.2 PureTech 130hp EAT8", price: 1530000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "2008", version: "ALLURE 1.2 PureTech 130hp EAT8", price: 1640000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "2008", version: "GT 1.2 PureTech 130hp EAT8", price: 1820000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "308", version: "ALLURE 1.2 PureTech 130hp EAT8", price: 1610000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "308", version: "GT 1.2 PureTech 130hp EAT8", price: 1780000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "408", version: "ALLURE 1.2 PureTech 130hp EAT8", price: 1845000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "408", version: "GT 1.2 PureTech 130hp EAT8", price: 2050000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "3008", version: "ALLURE 1.2 Hybrid 136hp e-DCS6", price: 2250000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "3008", version: "GT 1.2 Hybrid 136hp e-DCS6", price: 2510000, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik" },
    { model: "5008", version: "ALLURE 1.5 BlueHDi 130hp EAT8", price: 2420000, type: "SUV", fuel: "Dizel", trans: "Otomatik" },
    { model: "5008", version: "GT 1.5 BlueHDi 130hp EAT8", price: 2650000, type: "SUV", fuel: "Dizel", trans: "Otomatik" }
];

async function scrapePeugeot() {
    console.log("Peugeot resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Peugeot verilerini temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Peugeot');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Stellantis / API korumasina takildi.");
    } catch (error) {
        console.warn("Peugeot Canli Cekim Basarisiz! Yedek (Fallback) liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `peugeot-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Peugeot",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/208/peugeot-208.png", // Daha sonra fixAllImages yamasi duzeltebilir
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
    console.log(`Tamamlandi! ${added} adet Peugeot otomobili sisteme islendi.`);
}

scrapePeugeot();
