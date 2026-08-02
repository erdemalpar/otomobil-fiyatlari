const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

const parsePrice = (priceStr) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ''));
};

const generateId = (model, version) => {
    const safeModel = (model || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeVersion = (version || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `togg-${safeModel}-${safeVersion}`.replace(/-+$/g, '');
};

async function scrapeToggT10F() {
    console.log("Togg Görünmez Tarayıcı (Puppeteer) başlatılıyor...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    console.log("Togg T10F fiyat listesi sayfasına bağlanılıyor...");
    await page.goto('https://www.togg.com.tr/t10f-price-list', { waitUntil: 'networkidle2', timeout: 45000 });

    const data = await page.evaluate(() => {
        // Sayfadaki tum metni parcalara bol
        const text = document.body.innerText;
        return text;
    });
    
    await browser.close();

    console.log("Veri çekildi, analiz ediliyor...");

    // Versiyonları ve Fiyatları ayırmak için Regex (Örnek Metin formatına dayanarak)
    // "V1 RWD Standart Menzil V1 RWD Uzun Menzil V2 RWD Uzun Menzil V2 4More Teslim Fiyatları 1.884.980 ₺ 2.195.600 ₺ 2.370.930 ₺ 3.217.937 ₺"
    
    const versionMatch = data.match(/Versiyonlar\s+(.*?)\s+Teslim Fiyatları/is);
    const priceMatch = data.match(/Teslim Fiyatları\s+(.*?)(?:\s+Opsiyonlar|$)/is);

    if (!versionMatch || !priceMatch) {
        console.error("Metin yapısı Togg sitesinde değiştirilmiş, eşleşme sağlanamadı.");
        console.log("DOM içeriğinin bir kısmı:", data.substring(0, 1000));
        return;
    }

    // Togg'un V1 RWD, V2 gibi prefixlerini biliyoruz. Bu yüzden versiyonları manuel olarak metinden bölüyoruz.
    const rawVersions = versionMatch[1];
    // Regex ile versiyonları V harfiyle başlayan kelimelerden bölebiliriz.
    // Ancak en güvenlisi spesifik string replacement
    let vText = rawVersions.replace(/(V1 RWD Standart Menzil|V1 RWD Uzun Menzil|V2 RWD Uzun Menzil|V2 4More)/gi, '|||$1|||');
    const versions = vText.split('|||').map(s => s.trim()).filter(s => s.length > 5);

    // Fiyatları TL/₺ işaretinden bölüyoruz
    const rawPrices = priceMatch[1].match(/[0-9.]+\s*₺/g);

    if (!rawPrices || versions.length !== rawPrices.length) {
         console.error("Versiyon ve Fiyat sayısı eşleşmiyor!");
         console.log("Versions:", versions);
         console.log("Prices:", rawPrices);
         return;
    }

    console.log(`T10F için ${versions.length} adet varyasyon bulundu.`);

    let db;
    try {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error("Veritabanı okunamadı:", e);
        return;
    }

    // Eski Togg T10F araçlarını sil
    db.vehicles = db.vehicles.filter(v => !(v.brand === "Togg" && v.model === "T10F"));

    const newTogg = [];
    const usedIds = new Set();

    for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        const priceList = parsePrice(rawPrices[i]);

        let range = "Bilinmiyor";
        let hp = "Bilinmiyor";
        let chargeTime = "28 Dk (%20-80)";

        if (version.toLowerCase().includes("standart menzil")) {
             range = "350 km"; // T10F standart menzil tahmini (WLTP) veya placeholder
             hp = "218";
        } else if (version.toLowerCase().includes("uzun menzil")) {
             range = "600 km"; // T10F uzun menzil tahmini
             hp = "218";
        } else if (version.toLowerCase().includes("4more")) {
             range = "530 km"; // T10F 4More AWD
             hp = "435";
        }

        const id = generateId("T10F", version);
        if (usedIds.has(id)) continue;
        usedIds.add(id);

        const v = {
            id: id,
            brand: "Togg",
            model: "T10F",
            version: version,
            type: "Otomobil (Elektrik)",
            image_url: "https://www.togg.com.tr/assets/images/t10f/t10f_gallery_01.jpg", // Örnek T10F resmi
            features: ["Elektrik", "Otomatik", `${hp} bg`],
            specs: {
                fuel_type: "Elektrik",
                engine: "Bilinmiyor (EV)",
                horsepower: hp,
                transmission: "Otomatik",
                range: range,
                charge_time: chargeTime,
                torque: version.toLowerCase().includes("4more") ? "700 Nm" : "350 Nm"
            },
            package_features: [],
            prices_by_year: {
                "2025": Math.round((priceList * 0.85) / 1000) * 1000,
                "2026": priceList,
                "2027": Math.round((priceList * 1.15) / 1000) * 1000
            },
            price_list: priceList,
            price_campaign: priceList
        };

        newTogg.push(v);
    }

    db.vehicles = [...db.vehicles, ...newTogg];
    db.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Tamamlandı! ${newTogg.length} adet Togg T10F başarıyla sisteme entegre edildi.`);
}

scrapeToggT10F();
