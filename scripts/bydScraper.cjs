const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

const parsePrice = (priceStr) => parseInt(priceStr.replace(/[^0-9]/g, ''));

const generateId = (model) => `byd-${(model || "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+$/g, '');

const bydImages = {
    "SEAL": "https://www.bydauto.com.tr/assets/images/models/seal/seal-01.webp",
    "SEALION 7": "https://www.bydauto.com.tr/assets/images/models/sealion7/sealion7-01.webp",
    "HAN": "https://www.bydauto.com.tr/assets/images/models/han/han-01.webp",
    "TANG": "https://www.bydauto.com.tr/assets/images/models/tang/tang-01.webp",
    "ATTO 3": "https://www.bydauto.com.tr/assets/images/models/atto3/atto3-01.webp",
    "DOLPHIN": "https://www.bydauto.com.tr/assets/images/models/dolphin/dolphin-01.webp"
};

async function scrapeBYD() {
    console.log("BYD Görünmez Tarayıcı başlatılıyor...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    let rawText = "";
    try {
        await page.goto('https://www.bydauto.com.tr/fiyat-listesi', { waitUntil: 'domcontentloaded', timeout: 45000 });
        rawText = await page.evaluate(() => document.body.innerText);
    } catch(e) {
        console.log("BYD Sayfasına bağlanılamadı:", e.message);
    }
    
    await browser.close();

    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db.vehicles = db.vehicles.filter(v => v.brand !== 'BYD');

    const matches = rawText.match(/(BYD SEAL|BYD SEALION 7|BYD HAN|BYD TANG|BYD ATTO 3|BYD DOLPHIN)\s+(.*?)\s+(%[0-9]+)\s+([0-9.]+)\s+₺/gi);
    
    if (matches && matches.length > 0) {
        matches.forEach(m => {
            const parts = m.split('%');
            if (parts.length === 2) {
                // KESİN ÇÖZÜM: String'i böldükten sonra yalnızca rakam.rakam.rakam formatını regex ile yakala
                // ve sonrasında JavaScript Regex replace() ile noktaları silip int'e çevir.
                const priceStr = parts[1].split('₺')[0];
                const priceMatch = priceStr.match(/[0-9]{1,3}(?:\.[0-9]{3})+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;
                
                const modelAndVersion = parts[0].trim(); 
                const modelKey = Object.keys(bydImages).find(k => modelAndVersion.includes(k)) || "SEAL";
                const modelName = modelAndVersion.replace("BYD ", "");
                
                db.vehicles.push({
                    id: generateId(modelName),
                    brand: "BYD",
                    model: modelName.split(' ')[0],
                    version: modelName,
                    type: "Otomobil (Elektrik)",
                    image_url: bydImages[modelKey] || "https://www.bydauto.com.tr/assets/images/logo.svg",
                    features: ["Elektrik", "Otomatik"],
                    specs: { fuel_type: "Elektrik", engine: "EV", horsepower: "Bilinmiyor", transmission: "Otomatik", range: "500 km", charge_time: "30 Dk", torque: "Bilinmiyor" },
                    package_features: [],
                    prices_by_year: { "2025": Math.round((price * 0.9)/1000)*1000, "2026": price, "2027": Math.round((price * 1.15)/1000)*1000 },
                    price_list: price,
                    price_campaign: price
                });
            }
        });
        console.log(`BYD başarıyla çekildi: ${matches.length} araç.`);
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

scrapeBYD();
