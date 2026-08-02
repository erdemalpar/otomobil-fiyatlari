const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

const megaKatalog2 = [
    // --- TESLA (Eksikler) ---
    { brand: "Tesla", model: "Model 3", version: "Rear-Wheel Drive", price_list: 1640000, price_campaign: 1640000, image_url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "283 HP", range: "513 km", charge_time: "25 dk" } },
    { brand: "Tesla", model: "Model S", version: "Plaid", price_list: 6500000, price_campaign: 6500000, image_url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-S-Main-Hero-Desktop-LHD.jpg", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "1020 HP", range: "600 km", charge_time: "25 dk" } },
    { brand: "Tesla", model: "Model X", version: "Plaid", price_list: 7100000, price_campaign: 7100000, image_url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-X-Main-Hero-Desktop-LHD.jpg", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "1020 HP", range: "543 km", charge_time: "25 dk" } },

    // --- JAECOO & OMODA (Chery Alt Markaları) ---
    { brand: "Jaecoo", model: "J7", version: "1.6 TGDI Revive", price_list: 1920000, price_campaign: 1920000, image_url: "https://www.jaecoo.com.tr/assets/models/j7.png", specs: { year: "2026", engine: "1.6", transmission: "DCT", fuel: "Benzin", power: "145 HP" } },
    { brand: "Omoda", model: "Omoda 5", version: "1.6 TGDI Luxury", price_list: 1390000, price_campaign: 1390000, image_url: "https://www.omoda.com.tr/assets/models/omoda5.png", specs: { year: "2026", engine: "1.6", transmission: "DCT", fuel: "Benzin", power: "183 HP" } },

    // --- MINI ---
    { brand: "MINI", model: "Cooper", version: "C 3-Kapı", price_list: 1750000, price_campaign: 1750000, image_url: "https://www.mini.com.tr/content/dam/MINI/common/models/cooper-3-door/mini-cooper-3-door.png", specs: { year: "2026", engine: "1.5", transmission: "Otomatik", fuel: "Benzin", power: "156 HP" } },
    { brand: "MINI", model: "Countryman", version: "John Cooper Works ALL4", price_list: 3150000, price_campaign: 3150000, image_url: "https://www.mini.com.tr/content/dam/MINI/common/models/countryman/mini-countryman.png", specs: { year: "2026", engine: "2.0", transmission: "Otomatik", fuel: "Benzin", power: "300 HP" } },

    // --- VOLKSWAGEN (Eksikler) ---
    { brand: "Volkswagen", model: "Passat Variant", version: "1.5 eTSI R-Line", price_list: 2650000, price_campaign: 2650000, image_url: "https://binekarac.vw.com.tr/assets/images/models/passat-variant.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "DSG", fuel: "Hibrit", power: "150 HP" } },
    { brand: "Volkswagen", model: "Taigo", version: "1.0 TSI Style", price_list: 1550000, price_campaign: 1550000, image_url: "https://binekarac.vw.com.tr/assets/images/models/taigo.png", specs: { year: "2026", engine: "1.0", transmission: "DSG", fuel: "Benzin", power: "110 HP" } },
    { brand: "Volkswagen", model: "Touareg", version: "3.0 V6 TDI Elegance", price_list: 9550000, price_campaign: 9550000, image_url: "https://binekarac.vw.com.tr/assets/images/models/touareg.png", specs: { year: "2026", engine: "3.0 V6", transmission: "Otomatik", fuel: "Dizel", power: "286 HP" } },
    { brand: "Volkswagen", model: "Amarok", version: "2.0 TDI Style", price_list: 2150000, price_campaign: 2150000, image_url: "https://ticariarac.vw.com.tr/assets/images/models/amarok.png", specs: { year: "2026", engine: "2.0", transmission: "Otomatik", fuel: "Dizel", power: "205 HP" } },
    { brand: "Volkswagen", model: "Caddy", version: "2.0 TDI Life", price_list: 1190000, price_campaign: 1190000, image_url: "https://ticariarac.vw.com.tr/assets/images/models/caddy.png", specs: { year: "2026", engine: "2.0", transmission: "DSG", fuel: "Dizel", power: "122 HP" } },

    // --- AUDI (Eksikler) ---
    { brand: "Audi", model: "A4", version: "40 TDI quattro Advanced", price_list: 3650000, price_campaign: 3650000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "2.0", transmission: "S tronic", fuel: "Dizel", power: "204 HP" } },
    { brand: "Audi", model: "A6", version: "40 TDI quattro S line", price_list: 5150000, price_campaign: 5150000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "2.0", transmission: "S tronic", fuel: "Dizel", power: "204 HP" } },
    { brand: "Audi", model: "Q5", version: "40 TDI quattro S line", price_list: 4650000, price_campaign: 4650000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "2.0", transmission: "S tronic", fuel: "Dizel", power: "204 HP" } },
    { brand: "Audi", model: "Q7", version: "50 TDI quattro S line", price_list: 9250000, price_campaign: 9250000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "3.0 V6", transmission: "Tiptronic", fuel: "Dizel", power: "286 HP" } },

    // --- TOYOTA (Eksikler) ---
    { brand: "Toyota", model: "Yaris", version: "1.5 Hybrid Flame", price_list: 1390000, price_campaign: 1390000, image_url: "https://www.toyota.com.tr/images/models/yaris/yaris.png", specs: { year: "2026", engine: "1.5", transmission: "e-CVT", fuel: "Hibrit", power: "116 HP" } },
    { brand: "Toyota", model: "Yaris Cross", version: "1.5 Hybrid Passion", price_list: 1650000, price_campaign: 1650000, image_url: "https://www.toyota.com.tr/images/models/yaris-cross/yaris-cross.png", specs: { year: "2026", engine: "1.5", transmission: "e-CVT", fuel: "Hibrit", power: "116 HP" } },
    { brand: "Toyota", model: "RAV4", version: "2.5 Hybrid Passion", price_list: 3850000, price_campaign: 3850000, image_url: "https://www.toyota.com.tr/images/models/rav4/rav4.png", specs: { year: "2026", engine: "2.5", transmission: "e-CVT", fuel: "Hibrit", power: "222 HP" } },
    { brand: "Toyota", model: "Hilux", version: "2.4 D-4D Invincible", price_list: 1850000, price_campaign: 1850000, image_url: "https://www.toyota.com.tr/images/models/hilux/hilux.png", specs: { year: "2026", engine: "2.4", transmission: "Otomatik", fuel: "Dizel", power: "150 HP" } },

    // --- PEUGEOT (Eksikler) ---
    { brand: "Peugeot", model: "308", version: "GT 1.2 PureTech", price_list: 1680000, price_campaign: 1680000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/308/peugeot-308.png", specs: { year: "2026", engine: "1.2", transmission: "EAT8", fuel: "Benzin", power: "130 HP" } },
    { brand: "Peugeot", model: "508", version: "GT 1.5 BlueHDi", price_list: 2150000, price_campaign: 2150000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/508/peugeot-508.png", specs: { year: "2026", engine: "1.5", transmission: "EAT8", fuel: "Dizel", power: "130 HP" } },
    { brand: "Peugeot", model: "5008", version: "GT 1.5 BlueHDi", price_list: 2450000, price_campaign: 2450000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/5008/peugeot-5008.png", specs: { year: "2026", engine: "1.5", transmission: "EAT8", fuel: "Dizel", power: "130 HP" } },

    // --- DACIA (Eksikler) ---
    { brand: "Dacia", model: "Sandero Stepway", version: "Expression TCe 90", price_list: 1090000, price_campaign: 1050000, image_url: "https://www.dacia.com.tr/CountriesData/Turkey_TR/images/cars/sandero-stepway.png", specs: { year: "2026", engine: "1.0", transmission: "X-Tronic", fuel: "Benzin", power: "90 HP" } },
    { brand: "Dacia", model: "Jogger", version: "Extreme TCe 110", price_list: 1250000, price_campaign: 1250000, image_url: "https://www.dacia.com.tr/CountriesData/Turkey_TR/images/cars/jogger.png", specs: { year: "2026", engine: "1.0", transmission: "Manuel", fuel: "Benzin", power: "110 HP" } },

    // --- FIAT (Eksikler) ---
    { brand: "Fiat", model: "Panda", version: "1.0 Hybrid City", price_list: 840000, price_campaign: 840000, image_url: "https://otomobil.fiat.com.tr/content/dam/fiat/cross/models/panda/panda-city.png", specs: { year: "2026", engine: "1.0 MHEV", transmission: "Manuel", fuel: "Hibrit", power: "70 HP" } },
    { brand: "Fiat", model: "Fiorino", version: "1.4 Fire Pop", price_list: 785000, price_campaign: 785000, image_url: "https://ticari.fiat.com.tr/content/dam/fiat/cross/models/fiorino/fiorino.png", specs: { year: "2026", engine: "1.4", transmission: "Manuel", fuel: "Benzin", power: "77 HP" } },
    { brand: "Fiat", model: "Doblo", version: "1.5 BlueHDi Premio Plus", price_list: 1250000, price_campaign: 1250000, image_url: "https://ticari.fiat.com.tr/content/dam/fiat/cross/models/doblo/doblo.png", specs: { year: "2026", engine: "1.5", transmission: "Otomatik", fuel: "Dizel", power: "130 HP" } },

    // --- KIA (Eksikler) ---
    { brand: "Kia", model: "Stonic", version: "1.4L MPI Elegance", price_list: 1190000, price_campaign: 1150000, image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/stonic/stonic-2024.png", specs: { year: "2026", engine: "1.4", transmission: "Otomatik", fuel: "Benzin", power: "100 HP" } },
    { brand: "Kia", model: "Niro", version: "1.6L Hibrit Prestige", price_list: 1990000, price_campaign: 1990000, image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/niro/niro-2024.png", specs: { year: "2026", engine: "1.6 MHEV", transmission: "DCT", fuel: "Hibrit", power: "141 HP" } },
    { brand: "Kia", model: "Sorento", version: "1.6L Hibrit Prestige Smart", price_list: 3950000, price_campaign: 3950000, image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/sorento/sorento-2024.png", specs: { year: "2026", engine: "1.6 MHEV", transmission: "Otomatik", fuel: "Hibrit", power: "230 HP" } },

    // --- NISSAN (Eksikler) ---
    { brand: "Nissan", model: "Juke", version: "1.0 DIG-T Platinum", price_list: 1450000, price_campaign: 1450000, image_url: "https://www.nissan.com.tr/content/dam/Nissan/turkey/vehicles/juke/juke.png", specs: { year: "2026", engine: "1.0", transmission: "DCT", fuel: "Benzin", power: "115 HP" } },

    // --- SEAT & SKODA (Eksikler) ---
    { brand: "Seat", model: "Arona", version: "1.0 EcoTSI FR", price_list: 1390000, price_campaign: 1350000, image_url: "https://www.seat.com.tr/media/Kwc_Crop_Image_Component/60829-16625-image-crop/dh-1110-36ba9c/36dc7e2b/1632732943/seat-arona.png", specs: { year: "2026", engine: "1.0", transmission: "DSG", fuel: "Benzin", power: "110 HP" } },
    { brand: "Skoda", model: "Kamiq", version: "1.0 TSI Monte Carlo", price_list: 1650000, price_campaign: 1650000, image_url: "https://www.skoda.com.tr/models/kamiq/kamiq.png", specs: { year: "2026", engine: "1.0", transmission: "DSG", fuel: "Benzin", power: "115 HP" } },
    { brand: "Skoda", model: "Scala", version: "1.5 TSI Premium", price_list: 1490000, price_campaign: 1490000, image_url: "https://www.skoda.com.tr/models/scala/scala.png", specs: { year: "2026", engine: "1.5", transmission: "DSG", fuel: "Benzin", power: "150 HP" } },

    // --- VOLVO (Eksikler) ---
    { brand: "Volvo", model: "XC90", version: "B5 AWD Plus Bright", price_list: 5950000, price_campaign: 5950000, image_url: "https://www.volvocars.com/images/v/-/media/project/contentplatform/data/media/my24/xc90/xc90-hero.png", specs: { year: "2026", engine: "2.0 MHEV", transmission: "Otomatik", fuel: "Hibrit", power: "235 HP" } },
    { brand: "Volvo", model: "S90", version: "B5 AWD Plus Bright", price_list: 4950000, price_campaign: 4950000, image_url: "https://www.volvocars.com/images/v/-/media/project/contentplatform/data/media/my24/s90/s90-hero.png", specs: { year: "2026", engine: "2.0 MHEV", transmission: "Otomatik", fuel: "Hibrit", power: "235 HP" } },

    // --- SUZUKI & SUBARU (Eksikler) ---
    { brand: "Suzuki", model: "Jimny", version: "1.5 GLX AllGrip", price_list: 1650000, price_campaign: 1650000, image_url: "https://www.suzuki.com.tr/assets/models/jimny/jimny.png", specs: { year: "2026", engine: "1.5", transmission: "Otomatik", fuel: "Benzin", power: "102 HP" } },
    { brand: "Subaru", model: "Forester", version: "e-BOXER Xtreme", price_list: 2950000, price_campaign: 2950000, image_url: "https://www.subaru.com.tr/assets/models/forester/forester.png", specs: { year: "2026", engine: "2.0 MHEV", transmission: "Lineartronic", fuel: "Hibrit", power: "150 HP" } }
];

async function updateDatabasePart2() {
    console.log("Global Ingestion Bot (Part 2: Eksik Modeller & Yeni Markalar) Calisiyor...");
    let db = { vehicles: [], lastUpdated: new Date().toISOString() };
    
    if (fs.existsSync(DB_PATH)) {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }

    let addedCount = 0;

    for (const car of megaKatalog2) {
        // Aynı araç daha önce eklendiyse es geç
        const exists = db.vehicles.some(v => v.brand === car.brand && v.model === car.model && v.version === car.version);
        if (!exists) {
            db.vehicles.push({
                id: `mega2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...car
            });
            addedCount++;
        }
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    
    console.log(`Tamamlandi! ${addedCount} yeni EKSIK ARAC basariyla veritabanina eklendi.`);
    console.log(`Guncel toplam arac sayisi: ${db.vehicles.length}`);
}

updateDatabasePart2();
