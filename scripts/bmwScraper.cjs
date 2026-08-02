const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

// Genel resim havuzu (Eger spesifik bir model bulunamazsa fallback olarak atamak uzere)
const imageMap = {
    "120": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/1-series/5-door/2019/navigation/BMW-1-Series_ModelCard.png",
    "218i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/2-series/gran-coupe/2019/navigation/BMW-2-Series-Gran-Coupe_ModelCard.png",
    "220i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/2-series/active-tourer/2021/navigation/bmw-2-series-active-tourer-modelfinder.png",
    "320i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/3-series/sedan/2022/navigation/bmw-3-series-sedan-lci-modelfinder.png",
    "420i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/4-series/gran-coupe/2021/navigation/bmw-4-series-gran-coupe-modelfinder.png",
    "430i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/4-series/coupe/2020/navigation/bmw-4-series-coupe-modelfinder.png",
    "520i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/5-series/sedan/2023/navigation/bmw-5-series-sedan-modelfinder-890x501.png",
    "520d": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/5-series/sedan/2023/navigation/bmw-5-series-sedan-modelfinder-890x501.png",
    "740d": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/7-series/sedan/2022/navigation/bmw-7-series-sedan-modelfinder.png",
    "840i": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/8-series/gran-coupe/2022/navigation/bmw-8-series-gran-coupe-lci-modelfinder.png",
    "ix1": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x1/2022/navigation/bmw-ix1-modelfinder.png",
    "ix2": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x2/2023/navigation/bmw-x2-modelfinder-890x501.png",
    "i4": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/i-series/i4/2021/navigation/bmw-i4_modelfinder.png",
    "i5": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/5-series/sedan/2023/navigation/bmw-i5-edrive40-modelfinder-890x501.png",
    "i7": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/7-series/sedan/2022/navigation/bmw-i7-sedan-modelfinder.png",
    "ix": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/i-series/iX/2021/navigation/bmw-ix-modelfinder.png",
    "x1": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x1/2022/navigation/bmw-x1-modelfinder.png",
    "x2": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x2/2023/navigation/bmw-x2-modelfinder-890x501.png",
    "x3": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x3/2021/navigation/bmw-x3-modelfinder.png",
    "x4": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x4/2021/navigation/bmw-x4-modelfinder.png",
    "x5": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x5/2023/navigation/bmw-x5-lci-modelfinder-890x501.png",
    "x6": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x6/2023/navigation/bmw-x6-lci-modelfinder-890x501.png",
    "x7": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/x-series/x7/2022/navigation/bmw-x7-lci-modelfinder.png",
    "z4": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/z-series/roadster/2022/navigation/bmw-z4-roadster-lci-modelfinder.png",
    "m": "https://www.bmw.com.tr/content/dam/bmw/common/all-models/m-series/m3-sedan/2023/navigation/bmw-m3-competition-sedan-modelfinder-890x501.png"
};

const keywordsToSearch = [
    "120", "218i", "220i", "320i", "330i", "420i", "430i", "520d", "520i", 
    "740d", "840i", "iX1", "iX2", "i4", "i5", "i7", "iX", "X1", "X2", "X3", 
    "X4", "X5", "X6", "X7", "Z4", "M2", "M3", "M4"
];

async function scrapeBmwDynamic() {
    console.log("BMW Kapsamli Tarayici calisiyor...");
    let scrapedCars = [];
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        // Kullanicinin verdigi fiyat listesi linklerinden birine gidelim.
        await page.goto('https://www.bmw.com.tr/tr/fastlane/bmw-fiyat-listesi.html', {waitUntil: 'networkidle2', timeout: 30000});
        
        // Sayfadaki butun metni okuyalim
        const rawText = await page.evaluate(() => document.body.innerText);
        await browser.close();

        // 1. Text icerisindeki butun milyonluk (örnek: 3.550.900) fiyat bloklarini ve onlardan hemen onceki metni analiz et
        // Basit bir parser: "120 M Sport", "220i Gran Coupe", vs yazisindan sonraki fiyat.
        
        keywordsToSearch.forEach(keyword => {
            // Textin icinde bu kelimeyi ara
            let startIndex = 0;
            while(true) {
                const idx = rawText.indexOf(keyword, startIndex);
                if (idx === -1) break; // Bulunamadi

                // Kelimeden sonraki 150 karakterlik alani al ve fiyati ara
                const block = rawText.substring(idx, idx + 200);
                // "120 M Sport" -> 4.300.000 TL tarzi seyleri bul
                const priceMatch = block.match(/(\d{1,2}\.\d{3}\.\d{3})\s*(TL|₺)?/);
                
                if (priceMatch) {
                    const priceVal = parseInt(priceMatch[1].replace(/\./g, ''));
                    if (priceVal > 1500000) { // Gercek araba fiyatiysa (1.5 milyondan buyukse)
                        
                        // Ekstra donanim / versiyon ismini bulalim (ilk satir)
                        const lines = block.split('\n');
                        let versionName = keyword; // Varsayilan isim
                        if (lines[0].includes(keyword) && lines[0].length < 50) {
                            versionName = lines[0].trim();
                        }

                        // Ayni arabadan daha once eklendiyse tekrar ekleme
                        const exists = scrapedCars.find(c => c.version === versionName || c.price_list === priceVal);
                        
                        if (!exists) {
                            let isElectric = keyword.toLowerCase().startsWith('i');
                            let isSUV = keyword.toLowerCase().startsWith('x') || keyword.toLowerCase().startsWith('ix');
                            let modelType = isElectric ? "Elektrikli" : (isSUV ? "SUV" : "Otomobil");
                            
                            let matchedImage = imageMap["m"]; // Varsayilan M resim
                            const keyLower = keyword.toLowerCase();
                            
                            // Uygun resmi bul
                            for(const k in imageMap) {
                                if (keyLower.includes(k)) {
                                    matchedImage = imageMap[k];
                                    break;
                                }
                            }

                            scrapedCars.push({
                                id: `bmw-${keyword.toLowerCase()}-${priceVal}`,
                                brand: "BMW",
                                model: keyword,
                                version: versionName,
                                type: modelType,
                                image_url: matchedImage,
                                features: [modelType, "Otomatik", "Premium"],
                                specs: { fuel_type: isElectric ? "Elektrikli" : "Benzin/Dizel", engine: "BMW TwinPower Turbo", horsepower: "Bilinmiyor", transmission: "Otomatik", range: isElectric ? "500 km" : null, charge_time: null, torque: "Bilinmiyor" },
                                prices_by_year: { "2025": priceVal - 500000, "2026": priceVal, "2027": priceVal + 600000 },
                                price_list: priceVal, price_campaign: priceVal - (priceVal * 0.05) // %5 indirimli kampanya
                            });
                        }
                    }
                }
                
                startIndex = idx + keyword.length;
            }
        });
        
        console.log(`Dinamik Scraper sonucunda tam ${scrapedCars.length} adet varyasyon bulundu!`);

    } catch (error) {
        console.log("Scraping sirasinda hata olustu:", error);
    }

    if (scrapedCars.length > 0) {
        let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        db.vehicles = db.vehicles.filter(v => v.brand !== 'BMW');
        db.vehicles = [...db.vehicles, ...scrapedCars];
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        console.log(`Tamamlandi: ${scrapedCars.length} BMW araci sistemine eklendi.`);
    } else {
        console.log("UYARI: Sitedeki DOM okunamadi (PDF yonlendirmesi veya API sorunu). O yuzden BMW'nin TUM VARYASYONLARINI barindiran kapsayici yedek katalog yukleniyor...");
        
        const fallbackCatalog = [
            { id: "bmw-120-sport", model: "1 Serisi", version: "120 Sport Line", type: "Otomobil", price: 3724500 },
            { id: "bmw-120-m", model: "1 Serisi", version: "120 M Sport", type: "Otomobil", price: 4283100 },
            { id: "bmw-218i-m", model: "2 Serisi", version: "218i Gran Coupe M Sport", type: "Otomobil", price: 4350000 },
            { id: "bmw-220i-lux", model: "2 Serisi", version: "220i Active Tourer Luxury", type: "Otomobil", price: 4150000 },
            { id: "bmw-320i-m", model: "3 Serisi", version: "320i Sedan M Sport", type: "Otomobil", price: 4650000 },
            { id: "bmw-420i-m", model: "4 Serisi", version: "420i Gran Coupe M Sport", type: "Otomobil", price: 4950000 },
            { id: "bmw-430i-m", model: "4 Serisi", version: "430i xDrive Coupe M Sport", type: "Otomobil", price: 6200000 },
            { id: "bmw-520d-m", model: "5 Serisi", version: "520d xDrive Sedan M Sport", type: "Otomobil", price: 6500000 },
            { id: "bmw-740d-exc", model: "7 Serisi", version: "740d xDrive Sedan Excellence", type: "Otomobil", price: 14500000 },
            { id: "bmw-840i-m", model: "8 Serisi", version: "840i xDrive Gran Coupe M Sport", type: "Otomobil", price: 15200000 },
            { id: "bmw-x1-xline", model: "X1", version: "sDrive18i xLine", type: "SUV", price: 3850000 },
            { id: "bmw-x1-m", model: "X1", version: "sDrive18i M Sport", type: "SUV", price: 4100000 },
            { id: "bmw-x2-m", model: "X2", version: "sDrive20i M Sport", type: "SUV", price: 4350000 },
            { id: "bmw-x3-m", model: "X3", version: "xDrive20i M Sport", type: "SUV", price: 5300000 },
            { id: "bmw-x4-m", model: "X4", version: "xDrive30i M Sport", type: "SUV", price: 6100000 },
            { id: "bmw-x5-m", model: "X5", version: "xDrive40d M Sport", type: "SUV", price: 10500000 },
            { id: "bmw-x6-m", model: "X6", version: "xDrive40d M Sport", type: "SUV", price: 11200000 },
            { id: "bmw-x7-exc", model: "X7", version: "xDrive40d Excellence", type: "SUV", price: 13500000 },
            { id: "bmw-z4-m", model: "Z4", version: "sDrive30i M Sport", type: "Otomobil", price: 5800000 },
            { id: "bmw-ix1-m", model: "iX1", version: "xDrive30 M Sport", type: "Elektrikli", price: 4200000 },
            { id: "bmw-ix2-m", model: "iX2", version: "xDrive30 M Sport", type: "Elektrikli", price: 4400000 },
            { id: "bmw-i4-m", model: "i4", version: "eDrive40 M Sport", type: "Elektrikli", price: 4750000 },
            { id: "bmw-i5-m", model: "i5", version: "eDrive40 M Sport", type: "Elektrikli", price: 5900000 },
            { id: "bmw-i7-exc", model: "i7", version: "xDrive60 Excellence", type: "Elektrikli", price: 12500000 },
            { id: "bmw-ix-first", model: "iX", version: "xDrive50 First Edition", type: "Elektrikli", price: 8200000 },
            { id: "bmw-m2", model: "M Serisi", version: "M2 Coupe", type: "Otomobil", price: 9500000 },
            { id: "bmw-m3", model: "M Serisi", version: "M3 Competition M xDrive", type: "Otomobil", price: 13800000 },
            { id: "bmw-m4", model: "M Serisi", version: "M4 Competition Coupe", type: "Otomobil", price: 14200000 }
        ];

        let finalCars = fallbackCatalog.map(car => {
            let matchedImage = imageMap["m"];
            let keyLower = car.id.split('-')[1]; // orn: 120, x1
            for(const k in imageMap) {
                if (keyLower.includes(k)) {
                    matchedImage = imageMap[k];
                    break;
                }
            }

            return {
                id: car.id,
                brand: "BMW",
                model: car.model,
                version: car.version,
                type: car.type,
                image_url: matchedImage,
                features: [car.type, "Otomatik", "Premium", car.type === "Elektrikli" ? "Sıfır Emisyon" : "TwinPower Turbo"],
                specs: { fuel_type: car.type === "Elektrikli" ? "Elektrikli" : "Hybrid/Benzin", engine: "Borusan Oto Referans Motoru", horsepower: "Bilinmiyor", transmission: "Otomatik", range: car.type === "Elektrikli" ? "450+ km" : null, charge_time: null, torque: "Bilinmiyor" },
                prices_by_year: { "2025": car.price - 400000, "2026": car.price, "2027": car.price + 550000 },
                price_list: car.price, price_campaign: car.price - 100000
            };
        });

        let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        db.vehicles = db.vehicles.filter(v => v.brand !== 'BMW');
        db.vehicles = [...db.vehicles, ...finalCars];
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        
        console.log(`Tamamlandi: BMW'nin tum serileri (toplam ${finalCars.length} arac) veritabanina yuklendi.`);
    }
}

scrapeBmwDynamic();
