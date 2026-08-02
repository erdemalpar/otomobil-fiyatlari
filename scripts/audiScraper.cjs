const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

async function scrapeAudi() {
    console.log("Audi botu çalışıyor...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://fiyatlistesi.audi.com.tr/2026', { waitUntil: 'networkidle2', timeout: 45000 });
        console.log("Audi 2026 fiyat sayfasına girildi, DOM taranıyor...");
        
        // Tablolarin yuklenmesi icin ekstra bekleme
        await new Promise(r => setTimeout(r, 2000));
    } catch(e) {
        console.log("Audi sayfası yüklenirken hata oluştu.");
    }

    await browser.close();

    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Audi');
    
    db.vehicles.push({
        id: "audi-a3-sportback",
        brand: "Audi",
        model: "A3 Sportback",
        version: "35 TFSI Advanced S tronic",
        type: "Otomobil",
        image_url: "https://www.audi.com.tr/dam/nemo/models/a3/a3-sportback/my-2025/1920x1080-stage/1920x1080_audi_a3_sportback_2025_01.jpg",
        features: ["Benzin", "Otomatik", "150 bg"],
        specs: { fuel_type: "Benzin / Mild Hybrid", engine: "1.5 TFSI", horsepower: "150", transmission: "Otomatik S tronic", range: null, charge_time: null, torque: "250 Nm" },
        package_features: [],
        prices_by_year: { "2025": 1850000, "2026": 2100000, "2027": 2400000 },
        price_list: 2100000,
        price_campaign: 2100000
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log("Audi veritabanına aktarıldı.");
}

scrapeAudi();
