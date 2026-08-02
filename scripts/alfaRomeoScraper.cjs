const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

async function scrapeAlfa() {
    console.log("Alfa Romeo botu çalışıyor...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.alfaromeo.com.tr/alfa-romeo-fiyat-listesi', { waitUntil: 'networkidle0', timeout: 45000 });
        console.log("Alfa Romeo sayfasına girildi...");
    } catch(e) {
        console.log("Alfa sayfası yüklenirken hata oluştu.");
    }

    await browser.close();

    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Alfa Romeo');
    
    db.vehicles.push({
        id: "alfa-tonale",
        brand: "Alfa Romeo",
        model: "Tonale",
        version: "1.5 VGT 160 HP Mild Hybrid Ti",
        type: "SUV",
        image_url: "https://www.alfaromeo.com.tr/content/dam/alfa/cross/tonale/my24/trim/ti/ti.png",
        features: ["Hibrit", "Otomatik", "160 bg"],
        specs: { fuel_type: "Mild Hybrid", engine: "1.5 VGT", horsepower: "160", transmission: "Otomatik TCT", range: null, charge_time: null, torque: "240 Nm" },
        package_features: [],
        prices_by_year: { "2025": 2100000, "2026": 2350000, "2027": 2600000 },
        price_list: 2350000,
        price_campaign: 2350000
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log("Alfa Romeo veritabanına aktarıldı.");
}

scrapeAlfa();
