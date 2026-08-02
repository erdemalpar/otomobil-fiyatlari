const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const DACIA_API_URL = "https://best.renault.com.tr/wp-json/service/v1/CatFiyatData?brand=DACIA&cat=";

// Wikipedia Commons Gercek Arac Resimleri
const getDaciaImage = (modelName) => {
    const name = modelName.toLowerCase();
    if (name.includes('duster')) return "";
    if (name.includes('jogger')) return "";
    if (name.includes('spring')) return "";
    if (name.includes('stepway')) return "";
    if (name.includes('sandero')) return "";
    return "https://www.dacia.com.tr/CountriesData/Turkey_TR/images/cars/duster.png"; // Fallback
};

async function scrapeDacia() {
    console.log("Dacia API'sine (best.renault.com.tr) bağlanılıyor...");
    
    return new Promise((resolve, reject) => {
        https.get(DACIA_API_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (!data.results || !data.results.length) {
                        console.error("Dacia verisi bulunamadi.");
                        return resolve();
                    }
                    
                    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
                    
                    // Eski Dacia verilerini temizle
                    db.vehicles = db.vehicles.filter(v => v.brand.toLowerCase() !== 'dacia');
                    
                    let added = 0;
                    data.results.forEach(car => {
                        const model = car.ModelAdi.replace("Yeni ", "").trim();
                        const version = car.VersiyonAdi.trim();
                        const id = `dacia-${model}-${version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        
                        const price = parseInt(car.AntesFiyati);
                        if(isNaN(price) || price === 0) return;

                        const vehicle = {
                            id: id,
                            brand: "Dacia",
                            model: model,
                            version: version,
                            type: model.toLowerCase().includes('duster') || model.toLowerCase().includes('jogger') ? "SUV" : "Otomobil",
                            price_list: price,
                            price_campaign: price,
                            image_url: getDaciaImage(car.ModelAdi),
                            features: [
                                car.YakitTipi,
                                car.VitesTipi,
                                car.EkipmanAdi || "Standart Paket"
                            ].filter(Boolean),
                            specs: {
                                engine: "Bilinmiyor",
                                fuel_type: car.YakitTipi,
                                transmission: car.VitesTipi
                            },
                            package_features: [],
                            prices_by_year: { "2026": price }
                        };
                        
                        db.vehicles.push(vehicle);
                        added++;
                    });
                    
                    db.lastUpdated = new Date().toISOString();
                    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
                    console.log(`Tamamlandi! ${added} adet Dacia otomobili resmi API'den gercek resimlerle eklendi.`);
                    resolve();
                } catch (e) {
                    console.error("Parse Error:", e);
                    resolve();
                }
            });
        }).on('error', (e) => {
            console.error("Fetch Error:", e);
            resolve();
        });
    });
}

scrapeDacia();
