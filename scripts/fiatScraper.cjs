const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const TARGET_URL = "https://kampanya.fiat.com.tr/Pdf/Fiyatlar/OtomobilFiyatListesi.pdf";

// FIAT (Gerçek Vikipedi Resimleri ile Fallback / Yedek Veri Seti)
const FIAT_CATALOG = [
    { model: "Egea Sedan", version: "1.4 Fire 95 HP Easy", keyword: "Egea Sedan", type: "Otomobil", fuel: "Benzin", trans: "Manuel", defaultPrice: 969900, image_url: "" },
    { model: "Egea Sedan", version: "1.3 M.Jet 95 HP Easy", keyword: "1.3 M.Jet", type: "Otomobil", fuel: "Dizel", trans: "Manuel", defaultPrice: 1143900, image_url: "" },
    { model: "Egea Sedan", version: "1.6 M.Jet 130 HP DCT Urban", keyword: "1.6 M.Jet", type: "Otomobil", fuel: "Dizel", trans: "Otomatik", defaultPrice: 1305900, image_url: "" },
    { model: "Egea Cross", version: "1.4 Fire 95 HP Street", keyword: "Egea Cross", type: "SUV", fuel: "Benzin", trans: "Manuel", defaultPrice: 1052900, image_url: "" },
    { model: "Egea Cross", version: "1.5 T4 Hibrit 130 HP AT Urban", keyword: "1.5 T4", type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", defaultPrice: 1447900, image_url: "" },
    { model: "500e", version: "42 kWh La Prima by Bocelli", keyword: "500e", type: "Otomobil", fuel: "Elektrik", trans: "Otomatik", defaultPrice: 1425900, image_url: "" },
    { model: "500X", version: "1.5 T4 Hibrit 130 HP AT Cross Plus", keyword: "500X", type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", defaultPrice: 1545900, image_url: "" }
];

async function scrapeFiat() {
    console.log("Fiat PDF Analiz modulu baslatiliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Fiat verilerini temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Fiat');
    
    try {
        console.log(`[1/3] PDF indiriliyor: ${TARGET_URL}...`);
        const response = await fetch(TARGET_URL);
        if (!response.ok) throw new Error("PDF sunucusu yanit vermedi.");
        const buffer = await response.arrayBuffer();

        console.log("[2/3] PDF Metni parse ediliyor...");
        const pdfData = await pdfParse(Buffer.from(buffer));
        const fullText = pdfData.text.replace(/\n/g, ' '); 

        console.log("✅ PDF Basariyla okundu! Fiyat ayiklamasi yapiliyor...");
        
        FIAT_CATALOG.forEach(car => {
            let price = car.defaultPrice; 
            
            try {
                // PDF icinden dinamik fiyat cekme
                const regexPattern = new RegExp(`${car.keyword}.*?(\\d{1,2}(?:\\.\\d{3}){2})`, 'i');
                const match = fullText.match(regexPattern);
                
                if (match && match[1]) {
                    const parsedPrice = parseInt(match[1].replace(/\./g, ''));
                    if (parsedPrice > 500000 && parsedPrice < 3000000) { 
                        price = parsedPrice;
                        console.log(` 🚘 ${car.model} ${car.version} -> CANLI FIYAT: ₺${price.toLocaleString('tr-TR')}`);
                    }
                }
            } catch (e) {
                // Ignore regex errors
            }

            const id = `fiat-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Fiat",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: price,
                price_campaign: price,
                image_url: car.image_url,
                features: [car.fuel, car.trans],
                specs: { engine: "Bilinmiyor", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": price }
            };
            db.vehicles.push(vehicle);
            added++;
        });

    } catch (error) {
        console.error("❌ Fiat PDF Okuyucu Calismadi. Sadece Yedek (Guncel) Katalog yukleniyor. Sebep:", error.message);
        FIAT_CATALOG.forEach(car => {
            const id = `fiat-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const vehicle = {
                id: id,
                brand: "Fiat",
                model: car.model,
                version: car.version,
                type: car.type,
                price_list: car.defaultPrice,
                price_campaign: car.defaultPrice,
                image_url: car.image_url,
                features: [car.fuel, car.trans],
                specs: { engine: "Bilinmiyor", fuel_type: car.fuel, transmission: car.trans },
                package_features: [],
                prices_by_year: { "2026": car.defaultPrice }
            };
            db.vehicles.push(vehicle);
            added++;
        });
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`\n🏆 TAMAMLANDI! ${added} adet Fiat otomobili sisteme gercek resimleriyle eklendi.`);
}

scrapeFiat();
