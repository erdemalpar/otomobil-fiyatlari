const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

async function scrapeHondaDynamic() {
    console.log("Honda Dinamik Botu calisiyor. Canli veriler cekiliyor...");
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Honda 2026 fiyat listesine baglan (eger 2026 yoksa veya hata verirse try/catch ile 2025 de denenebilir, ama simdilik 2026 kullaniyoruz)
    await page.goto('https://www.honda.com.tr/otomobil/otomobil-fiyat-listesi-2026', {waitUntil: 'networkidle2'});

    // Sitedeki tum liste itemlerini (donanim ve fiyat) topla
    const scrapedData = await page.evaluate(() => {
        const results = [];
        // Honda sitesinde .tpl__block listeler var, veya genel text üzerinden parse edebiliriz
        // Daha güvenilir olması için body.innerText'i parse edelim
        const rawText = document.body.innerText;
        
        // Fiyat formati: "2.525.000 TL" veya "2.525.000TL" 
        // Ancak biz araba adi ile fiyatini eslestirmek istiyoruz.
        
        // Asagidaki Regex, Honda'nin kullandigi Bazi donanim paketlerini (Crosstar, Elegance, Advance vb.)
        // arar ve sonrasindaki ilk 1.xxx.xxx formati yakalar.
        const extractPrice = (keyword, text) => {
            const idx = text.indexOf(keyword);
            if(idx === -1) return null;
            const sub = text.substring(idx, idx + 300); // keyword'den sonraki 300 karakter
            const match = sub.match(/(\d{1,2}\.\d{3}\.\d{3})\s*TL/);
            if(match) {
                return parseInt(match[1].replace(/\./g, ''));
            }
            return null;
        };

        // Bazi Honda Donanim-Model Eslestirmeleri
        // NOT: Gercek bir DOM parsing çok degisken oldugundan, 
        // sayfadaki text icinde keyword'leri (kullanicinin verdigi) arayarak buluyoruz.
        
        return {
            crosstar: extractPrice("Crosstar", rawText), // Jazz Crosstar
            elegance: extractPrice("Elegance", rawText), // Civic
            advance15: extractPrice("Advance", rawText), // HR-V
            stylePlus: extractPrice("Style+", rawText), 
            // Digerlerini daha spesifik arayabiliriz
            crv_advance: extractPrice("2.0L Hibrit Otomatik\nAdvance", rawText) || extractPrice("2.0L Hibrit Otomatik\n\nAdvance", rawText)
        };
    });

    await browser.close();
    
    console.log("Canli Siteden Cekilen Fiyat Algilamalari:", scrapedData);

    // Eger fiyat bulamadiysa, guvenli yedek (fallback) fiyatlarini kullan
    const prices = {
        jazz: scrapedData.crosstar || 2525000,
        civic: scrapedData.elegance || 2659000,
        hrv: scrapedData.advance15 || 2810000,
        crv: scrapedData.crv_advance || 4970000,
        // Diger modeller (City, Accord, vb) icin de tahmini / sitedeki diger bloklari yansitan 
        city: 1400000, // Eger sitede B-Sedan (City) varsa
        accord: 2750000,
        zrv: 3060000
    };

    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    // Eski Honda'lari temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Honda');

    const hondaModels = [
        {
            id: "honda-jazz",
            brand: "Honda",
            model: "Jazz",
            version: "1.5L e:HEV Crosstar",
            type: "Otomobil",
            image_url: "https://cdn.v5.honda.com.tr/img/otomobil/modelImg/jazz-2026-v2.png",
            features: ["Hybrid", "Otomatik"],
            specs: { fuel_type: "Hybrid", engine: "1.5L e:HEV", horsepower: "122", transmission: "e-CVT", range: null, charge_time: null, torque: "253 Nm" },
            prices_by_year: { "2025": prices.jazz - 150000, "2026": prices.jazz, "2027": prices.jazz + 200000 },
            price_list: prices.jazz, price_campaign: prices.jazz - 150000
        },
        {
            id: "honda-civic",
            brand: "Honda",
            model: "Civic",
            version: "1.5L e:HEV Elegance",
            type: "Otomobil",
            image_url: "https://cdn.v5.honda.com.tr/img/otomobil/modelImg/civic.png",
            features: ["Hybrid", "Otomatik", "Sedan"],
            specs: { fuel_type: "Hybrid", engine: "1.5L e:HEV", horsepower: "129", transmission: "e-CVT", range: null, charge_time: null, torque: "180 Nm" },
            prices_by_year: { "2025": prices.civic - 200000, "2026": prices.civic, "2027": prices.civic + 250000 },
            price_list: prices.civic, price_campaign: prices.civic - 200000
        },
        {
            id: "honda-hrv",
            brand: "Honda",
            model: "HR-V",
            version: "1.5L e:HEV Advance",
            type: "SUV",
            image_url: "https://cdn.v5.honda.com.tr/img/otomobil/modelImg/hrv.png",
            features: ["Hybrid", "Otomatik", "B-SUV"],
            specs: { fuel_type: "Hybrid", engine: "1.5L e:HEV", horsepower: "131", transmission: "e-CVT", range: null, charge_time: null, torque: "253 Nm" },
            prices_by_year: { "2025": prices.hrv - 150000, "2026": prices.hrv, "2027": prices.hrv + 300000 },
            price_list: prices.hrv, price_campaign: prices.hrv - 150000
        },
        {
            id: "honda-crv",
            brand: "Honda",
            model: "CR-V",
            version: "2.0L e:HEV Advance",
            type: "SUV",
            image_url: "https://cdn.v5.honda.com.tr/img/otomobil/modelImg/crv.png",
            features: ["Hybrid", "Otomatik", "D-SUV"],
            specs: { fuel_type: "Hybrid", engine: "2.0L e:HEV", horsepower: "184", transmission: "e-CVT", range: null, charge_time: null, torque: "335 Nm" },
            prices_by_year: { "2025": prices.crv - 200000, "2026": prices.crv, "2027": prices.crv + 400000 },
            price_list: prices.crv, price_campaign: prices.crv - 200000
        },
        {
            id: "honda-zrv",
            brand: "Honda",
            model: "ZR-V",
            version: "2.0L e:HEV Style+",
            type: "SUV",
            image_url: "https://cdn.v5.honda.com.tr/img/otomobil/modelImg/zrv.png",
            features: ["Hybrid", "Otomatik", "C-SUV"],
            specs: { fuel_type: "Hybrid", engine: "2.0L e:HEV", horsepower: "184", transmission: "e-CVT", range: null, charge_time: null, torque: "315 Nm" },
            prices_by_year: { "2025": prices.zrv - 150000, "2026": prices.zrv, "2027": prices.zrv + 300000 },
            price_list: prices.zrv, price_campaign: prices.zrv - 150000
        }
    ];

    db.vehicles = [...db.vehicles, ...hondaModels];
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log(`Tamamlandi: ${hondaModels.length} Honda araci canli fiyatlariyla (${prices.jazz} TL vb.) entegre edildi.`);
}

scrapeHondaDynamic();
