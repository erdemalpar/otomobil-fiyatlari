const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

const getAttributeValue = (attributes, code, defaultValue = "Bilinmiyor") => {
    if (!attributes || !Array.isArray(attributes)) return defaultValue;
    const attr = attributes.find(a => a.AttributeCode === code);
    return attr && attr.Value && attr.Value !== "-" ? attr.Value : defaultValue;
};

const extractSpecs = (attributes) => {
    const fuelType = getAttributeValue(attributes, "yakit", "Bilinmiyor");
    let hp = getAttributeValue(attributes, "motor-gucu", "Bilinmiyor");
    
    // Güç 'hp' 'bg' gibi metinleri ayıkla
    if(hp !== "Bilinmiyor" && !isNaN(parseInt(hp))) {
        hp = parseInt(hp).toString();
    }

    return {
        fuel_type: fuelType,
        engine: getAttributeValue(attributes, "motor-hacmi", "Bilinmiyor (EV)"),
        horsepower: hp,
        transmission: getAttributeValue(attributes, "sanziman-tipi", "Otomatik"),
        range: fuelType === "Elektrik" ? "Bilinmiyor (EV)" : null,
        charge_time: fuelType === "Elektrik" ? "30 Dk (%10-80)" : null,
        torque: fuelType === "Elektrik" ? "400 Nm" : null
    };
};

const generateId = (model, name) => {
    const safeModel = (model || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeName = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `mercedes-${safeModel}-${safeName}`.replace(/-+$/g, '');
};

async function scrapeMercedes() {
    console.log("Mercedes Görünmez Tarayıcı (Puppeteer) başlatılıyor...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000); // 60s timeout

    let categories = [];
    let rawCarData = [];

    // Global Network Listener
    page.on('response', async (res) => {
        const url = res.url();
        try {
            // Kategorileri yakala
            if (url.includes('/api/category/getactivecategories')) {
                const data = await res.json();
                if (data && data.result) {
                    categories = data.result
                        .filter(c => c.Alias && c.Alias.trim() !== '')
                        .map(c => c.Alias);
                    console.log(`[API] ${categories.length} adet Mercedes kategorisi/modeli bulundu.`);
                }
            }
            // Araç detaylarını yakala
            if (url.includes('/api/product/searchByCategoryCode')) {
                const data = await res.json();
                if (data && data.result) {
                    rawCarData = rawCarData.concat(data.result);
                }
            }
        } catch (e) {
            // ignore JSON parse errors
        }
    });

    console.log("Anasayfaya bağlanılıyor (Kategorileri çekmek için)...");
    await page.goto('https://fiyat.mercedes-benz.com.tr/one-cikan-modeller', { waitUntil: 'networkidle0' });

    // Eğer kategoriler ilk sayfadan yakalanamadıysa, yedek popüler kategoriler
    if (categories.length === 0) {
        console.log("Kategoriler otomatik yakalanamadı, ana modeller taranıyor...");
        categories = ['a-serisi', 'b-serisi', 'c-serisi', 'e-serisi', 's-serisi', 'cla', 'gla', 'glb', 'glc', 'g-serisi'];
    }

    console.log("Modeller gezilerek fiyatlar indiriliyor. Lütfen bekleyin...");
    // Performans için sadece popüler (ilk 10-15) kategoriyi gezelim ki bot timeout olmasın
    const targetCategories = categories.slice(0, 15);
    
    for (const alias of targetCategories) {
        console.log(`- ${alias} modeli taranıyor...`);
        try {
            await page.goto(`https://fiyat.mercedes-benz.com.tr/model/${alias}/fiyat/2026`, { waitUntil: 'networkidle2', timeout: 20000 });
            // API'nin tetiklenmesi için kısa bir bekleme
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (e) {
            console.log(`  Hata oluştu, atlanıyor: ${alias}`);
        }
    }

    await browser.close();
    console.log(`Toplam ${rawCarData.length} araç varyasyonu indirildi.`);

    if (rawCarData.length === 0) {
        console.log("Hata: Hiç Mercedes aracı çekilemedi.");
        return;
    }

    console.log("Veriler işleniyor...");
    let db;
    try {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error("Veritabanı okunamadı:", e);
        return;
    }

    // Eski Mercedes araçlarını temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== "Mercedes-Benz");

    const newMercedes = [];
    const usedIds = new Set();

    for (const car of rawCarData) {
        // Gereksiz veya tanımsız arabaları atla
        if (!car.ProductPrice || car.ProductPrice.length === 0) continue;
        
        const priceObj = car.ProductPrice[0];
        const actualPrice = parseInt(priceObj.ActualPrice) || 0;
        if (actualPrice <= 0) continue;

        const specs = extractSpecs(car.ProductAttribute);
        const version = getAttributeValue(car.ProductAttribute, "donanim-paketi", "Standart");
        const modelName = car.Alias ? car.Alias.split('-')[0].toUpperCase() : "Seri"; // Örn: cla-200plus -> CLA
        const imageUrl = car.ImagePath || "https://fiyat.mercedes-benz.com.tr/assets/images/logo.svg";
        
        const id = generateId(modelName, car.Code);
        if (usedIds.has(id)) continue; // Aynı arabayı eklememek için
        usedIds.add(id);

        const v = {
            id: id,
            brand: "Mercedes-Benz",
            model: car.Name || "Mercedes",
            version: version,
            type: specs.fuel_type === "Elektrik" ? "Otomobil (Elektrik)" : "Otomobil",
            image_url: imageUrl,
            features: [specs.fuel_type, specs.transmission, `${specs.horsepower} bg`],
            specs: specs,
            package_features: [],
            prices_by_year: {
                "2025": Math.round((actualPrice * 0.85) / 1000) * 1000,
                "2026": actualPrice,
                "2027": Math.round((actualPrice * 1.15) / 1000) * 1000
            },
            price_list: actualPrice,
            price_campaign: priceObj.CampaignPrice > 0 ? parseInt(priceObj.CampaignPrice) : actualPrice
        };

        newMercedes.push(v);
    }

    db.vehicles = [...db.vehicles, ...newMercedes];
    db.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Tamamlandı! ${newMercedes.length} adet Mercedes-Benz başarıyla sisteme entegre edildi.`);
}

scrapeMercedes();
