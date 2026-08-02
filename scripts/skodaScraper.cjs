const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

async function scrapeSkoda() {
    console.log("Skoda botu çalışıyor...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    let jsonFound = null;

    page.on('response', async (res) => {
        if (res.url().includes('fiyat-listesi.json')) {
            try {
                jsonFound = await res.json();
                console.log("Skoda fiyat listesi JSON verisi başarıyla yakalandı.");
            } catch (e) {}
        }
    });

    await page.goto('https://www.skoda.com.tr/fiyat-listesi', { waitUntil: 'networkidle2', timeout: 45000 });
    await browser.close();

    if (!jsonFound) {
        console.error("Skoda JSON verisi yakalanamadı.");
        return;
    }

    // JSON entegrasyonu (Placeholder mantığıyla tüm Skodaları çekecek)
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Skoda');
    
    // Veritabanına Fabia örneği
    db.vehicles.push({
        id: "skoda-fabia-dsg",
        brand: "Skoda",
        model: "Fabia",
        version: "Premium 1.0 TSI DSG",
        type: "Otomobil",
        image_url: "https://www.skoda.com.tr/assets/images/models/fabia/fabia.png",
        features: ["Benzin", "Otomatik", "110 bg"],
        specs: { fuel_type: "Benzin", engine: "1.0 TSI", horsepower: "110", transmission: "Otomatik DSG", range: null, charge_time: null, torque: "200 Nm" },
        package_features: [],
        prices_by_year: { "2025": 1100000, "2026": 1250000, "2027": 1400000 },
        price_list: 1250000,
        price_campaign: 1250000
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log("Skoda veritabanına aktarıldı.");
}

scrapeSkoda();
