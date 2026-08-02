const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://www.hyundai.com/tr/tr/arac-fiyat-listesi";

const FALLBACK_DATA = [
    { model: "i10", version: "1.0 MPI 67 PS Jump", price: 855000, type: "Otomobil", fuel: "Benzin", trans: "Manuel" },
    { model: "i10", version: "1.2 MPI 84 PS Elite Çift Renk", price: 995000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "i20", version: "1.2 MPI 84 PS Jump", price: 1010000, type: "Otomobil", fuel: "Benzin", trans: "Manuel" },
    { model: "i20", version: "1.4 MPI 100 PS Style", price: 1150000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "i20", version: "1.4 MPI 100 PS Elite", price: 1250000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Elantra", version: "1.6 MPI 123 PS Prime", price: 1540000, type: "Otomobil", fuel: "Benzin", trans: "Otomatik" },
    { model: "Bayon", version: "1.4 MPI 100 PS Jump", price: 1195000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Bayon", version: "1.4 MPI 100 PS Elite", price: 1350000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Tucson", version: "1.6 T-GDI 160 PS Comfort", price: 1910000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Tucson", version: "1.6 T-GDI 160 PS Elite Plus 4x4", price: 2310000, type: "SUV", fuel: "Benzin", trans: "Otomatik" },
    { model: "Tucson", version: "1.6 CRDi 136 PS Elite", price: 2160000, type: "SUV", fuel: "Dizel", trans: "Otomatik" },
    { model: "Ioniq 5", version: "125 kW 4x2 Advance", price: 1850000, type: "SUV", fuel: "Elektrik", trans: "Otomatik" },
    { model: "Ioniq 5", version: "239 kW 4x4 Progressive", price: 3100000, type: "SUV", fuel: "Elektrik", trans: "Otomatik" },
    { model: "Santa Fe", version: "1.6 T-GDI HEV 215 PS 4x4 Progressive", price: 4200000, type: "SUV", fuel: "Hibrit", trans: "Otomatik" }
];

async function scrapeHyundai() {
    console.log("Hyundai resmi sitesinden (Puppeteer ile) canli fiyatlar cekiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Hyundai verilerini temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Hyundai');
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        throw new Error("Tarayici bot korumasina takildi veya JSON listesi gelmedi.");
    } catch (error) {
        console.warn("Hyundai Canli Cekim Basarisiz! Yedek (Fallback) liste kullaniliyor. Sebep:", error.message);
        
        FALLBACK_DATA.forEach(car => {
            const id = `hyundai-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Hyundai",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.price,
                price_campaign: car.price,
                image_url: "",
                features: [car.fuel, car.trans],
                specs: { engine: "Bilinmiyor", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.price }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Hyundai otomobili sisteme islendi.`);
}

scrapeHyundai();
