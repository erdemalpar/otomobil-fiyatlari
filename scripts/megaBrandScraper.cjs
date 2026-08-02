const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

const megaKatalog = [
    // --- TESLA ---
    { brand: "Tesla", model: "Model Y", version: "Rear-Wheel Drive", price_list: 1790453, price_campaign: 1790453, image_url: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "299 HP", range: "455 km", charge_time: "25 dk" } },
    { brand: "Tesla", model: "Model Y", version: "Long Range AWD", price_list: 3082534, price_campaign: 3082534, image_url: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "514 HP", range: "533 km", charge_time: "25 dk" } },
    { brand: "Tesla", model: "Model Y", version: "Performance AWD", price_list: 3340534, price_campaign: 3340534, image_url: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "534 HP", range: "514 km", charge_time: "25 dk" } },
    
    // --- BYD ---
    { brand: "BYD", model: "Atto 3", version: "Design", price_list: 1740000, price_campaign: 1640000, image_url: "https://www.bydauto.com.tr/uploads/models/atto3/colors/surf-blue.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "204 HP", range: "420 km", charge_time: "29 dk" } },
    { brand: "BYD", model: "Seal U", version: "Design DM-i", price_list: 2150000, price_campaign: 2150000, image_url: "https://www.bydauto.com.tr/uploads/models/sealu/colors/delan-black.png", specs: { year: "2026", engine: "1.5 PHEV", transmission: "Otomatik", fuel: "Hibrit", power: "218 HP", range: "1080 km", charge_time: "35 dk" } },
    { brand: "BYD", model: "Dolphin", version: "Comfort", price_list: 1320000, price_campaign: 1320000, image_url: "https://www.bydauto.com.tr/uploads/models/dolphin/colors/urban-grey.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "204 HP", range: "427 km", charge_time: "29 dk" } },

    // --- FIAT ---
    { brand: "Fiat", model: "Egea", version: "1.4 Fire Easy", price_list: 1045900, price_campaign: 999900, image_url: "https://otomobil.fiat.com.tr/content/dam/fiat/cross/models/tipo-hatchback/colors/tipo-hb-gelato-white.png", specs: { year: "2026", engine: "1.4", transmission: "Manuel", fuel: "Benzin", power: "95 HP" } },
    { brand: "Fiat", model: "Egea", version: "1.6 M.Jet Lounge", price_list: 1420900, price_campaign: 1400900, image_url: "https://otomobil.fiat.com.tr/content/dam/fiat/cross/models/tipo-hatchback/colors/tipo-hb-gelato-white.png", specs: { year: "2026", engine: "1.6", transmission: "Otomatik", fuel: "Dizel", power: "130 HP" } },
    { brand: "Fiat", model: "500e", version: "La Prima by Bocelli", price_list: 1495900, price_campaign: 1425900, image_url: "https://otomobil.fiat.com.tr/content/dam/fiat/500e/colors/500e-rose-gold.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "118 HP", range: "320 km" } },

    // --- AUDI ---
    { brand: "Audi", model: "A3 Sportback", version: "35 TFSI Advanced", price_list: 2450000, price_campaign: 2450000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "1.5 Mild Hybrid", transmission: "S tronic", fuel: "MHEV", power: "150 HP" } },
    { brand: "Audi", model: "A3 Sportback", version: "35 TFSI S line", price_list: 2650000, price_campaign: 2650000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "1.5 Mild Hybrid", transmission: "S tronic", fuel: "MHEV", power: "150 HP" } },
    { brand: "Audi", model: "Q3", version: "35 TFSI Advanced", price_list: 3100000, price_campaign: 3100000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "1.5", transmission: "S tronic", fuel: "Benzin", power: "150 HP" } },
    { brand: "Audi", model: "e-tron", version: "GT quattro", price_list: 8450000, price_campaign: 8450000, image_url: "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpna6yT1zAAAhs3QCGwAAAA?mimetype=image/png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "476 HP", range: "488 km" } },

    // --- DACIA ---
    { brand: "Dacia", model: "Duster", version: "Essential TCe 90", price_list: 1189900, price_campaign: 1189900, image_url: "https://www.dacia.com.tr/CountriesData/Turkey_TR/images/cars/duster.png", specs: { year: "2026", engine: "1.0", transmission: "Manuel", fuel: "Benzin", power: "90 HP" } },
    { brand: "Dacia", model: "Duster", version: "Journey Blue dCi 115 4x4", price_list: 1555000, price_campaign: 1555000, image_url: "https://www.dacia.com.tr/CountriesData/Turkey_TR/images/cars/duster.png", specs: { year: "2026", engine: "1.5", transmission: "Manuel", fuel: "Dizel", power: "115 HP" } },
    { brand: "Dacia", model: "Spring", version: "Extreme Electric 65", price_list: 895000, price_campaign: 895000, image_url: "https://www.dacia.com.tr/CountriesData/Turkey_TR/images/cars/spring.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "65 HP", range: "220 km" } },

    // --- KIA ---
    { brand: "Kia", model: "Picanto", version: "1.0L AMT Feel", price_list: 890000, price_campaign: 860000, image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/picanto/picanto-2024.png", specs: { year: "2026", engine: "1.0", transmission: "Otomatik", fuel: "Benzin", power: "67 HP" } },
    { brand: "Kia", model: "Sportage", version: "1.6L Hibrit Elegance", price_list: 2350000, price_campaign: 2280000, image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/sportage/sportage-2024.png", specs: { year: "2026", engine: "1.6 MHEV", transmission: "DCT", fuel: "Hibrit", power: "150 HP" } },
    { brand: "Kia", model: "EV6", version: "225 PS 4X2 Prestige", price_list: 2850000, price_campaign: 2850000, image_url: "https://www.kia.com/content/dam/kwcms/tr/tr/images/vehicles/ev6/ev6-2024.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "225 HP", range: "504 km" } },

    // --- NISSAN ---
    { brand: "Nissan", model: "Qashqai", version: "1.3 DIG-T MHEV Tekna", price_list: 1950000, price_campaign: 1850000, image_url: "https://www.nissan.com.tr/content/dam/Nissan/turkey/vehicles/qashqai/j12/qashqai-j12.png", specs: { year: "2026", engine: "1.3 MHEV", transmission: "X-Tronic", fuel: "Hibrit", power: "158 HP" } },
    { brand: "Nissan", model: "Qashqai", version: "e-POWER Platinum Premium", price_list: 2450000, price_campaign: 2380000, image_url: "https://www.nissan.com.tr/content/dam/Nissan/turkey/vehicles/qashqai/j12/qashqai-j12.png", specs: { year: "2026", engine: "1.5 e-POWER", transmission: "Otomatik", fuel: "Hibrit", power: "190 HP" } },
    { brand: "Nissan", model: "X-Trail", version: "e-4ORCE Platinum", price_list: 3250000, price_campaign: 3250000, image_url: "https://www.nissan.com.tr/content/dam/Nissan/turkey/vehicles/x-trail/t33/x-trail-t33.png", specs: { year: "2026", engine: "1.5 e-4ORCE", transmission: "Otomatik", fuel: "Hibrit", power: "213 HP" } },

    // --- MAZDA ---
    { brand: "Mazda", model: "CX-5", version: "2.0L Power Sense", price_list: 2890000, price_campaign: 2890000, image_url: "https://www.mazda.com.tr/assets/models/cx-5/mazda-cx-5.png", specs: { year: "2026", engine: "2.0", transmission: "Otomatik", fuel: "Benzin", power: "165 HP" } },

    // --- MITSUBISHI ---
    { brand: "Mitsubishi", model: "Space Star", version: "1.2 Intense CVT", price_list: 975000, price_campaign: 950000, image_url: "https://www.mitsubishi-motors.com.tr/assets/models/spacestar/spacestar.png", specs: { year: "2026", engine: "1.2", transmission: "CVT", fuel: "Benzin", power: "71 HP" } },

    // --- PEUGEOT ---
    { brand: "Peugeot", model: "208", version: "ACTIVE 1.2 PureTech 100hp", price_list: 1250000, price_campaign: 1210000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/208/peugeot-208.png", specs: { year: "2026", engine: "1.2", transmission: "EAT8", fuel: "Benzin", power: "100 HP" } },
    { brand: "Peugeot", model: "3008", version: "ALLURE 1.5 BlueHDi 130hp", price_list: 2200000, price_campaign: 2150000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/3008/peugeot-3008.png", specs: { year: "2026", engine: "1.5", transmission: "EAT8", fuel: "Dizel", power: "130 HP" } },
    { brand: "Peugeot", model: "408", version: "GT 1.2 PureTech 130hp", price_list: 2100000, price_campaign: 2050000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/408/peugeot-408.png", specs: { year: "2026", engine: "1.2", transmission: "EAT8", fuel: "Benzin", power: "130 HP" } },
    { brand: "Peugeot", model: "E-2008", version: "GT 115kW", price_list: 1680000, price_campaign: 1680000, image_url: "https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/our-range/2008/peugeot-e-2008.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "156 HP", range: "406 km" } },

    // --- SEAT & CUPRA ---
    { brand: "Seat", model: "Ibiza", version: "1.0 EcoTSI Style", price_list: 1190000, price_campaign: 1150000, image_url: "https://www.seat.com.tr/media/Kwc_Crop_Image_Component/60829-16625-image-crop/dh-1110-36ba9c/36dc7e2b/1632732943/seat-ibiza.png", specs: { year: "2026", engine: "1.0", transmission: "DSG", fuel: "Benzin", power: "110 HP" } },
    { brand: "Seat", model: "Leon", version: "1.5 eTSI FR", price_list: 1750000, price_campaign: 1750000, image_url: "https://www.seat.com.tr/media/Kwc_Crop_Image_Component/60829-16625-image-crop/dh-1110-36ba9c/36dc7e2b/1632732943/seat-leon.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "DSG", fuel: "Hibrit", power: "150 HP" } },
    { brand: "Cupra", model: "Formentor", version: "1.5 TSI", price_list: 2050000, price_campaign: 2050000, image_url: "https://www.cupraofficial.com.tr/media/Kwc_Crop_Image_Component/60829-16625-image-crop/dh-1110-36ba9c/36dc7e2b/1632732943/cupra-formentor.png", specs: { year: "2026", engine: "1.5", transmission: "DSG", fuel: "Benzin", power: "150 HP" } },

    // --- SKODA ---
    { brand: "Skoda", model: "Octavia", version: "1.5 TSI e-TEC Premium", price_list: 1850000, price_campaign: 1850000, image_url: "https://www.skoda.com.tr/models/octavia/octavia.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "DSG", fuel: "Hibrit", power: "150 HP" } },
    { brand: "Skoda", model: "Superb", version: "1.5 TSI e-TEC Prestige", price_list: 2450000, price_campaign: 2450000, image_url: "https://www.skoda.com.tr/models/superb/superb.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "DSG", fuel: "Hibrit", power: "150 HP" } },
    { brand: "Skoda", model: "Kodiaq", version: "1.5 TSI Sportline", price_list: 2750000, price_campaign: 2750000, image_url: "https://www.skoda.com.tr/models/kodiaq/kodiaq.png", specs: { year: "2026", engine: "1.5", transmission: "DSG", fuel: "Benzin", power: "150 HP" } },

    // --- SUZUKI & SUBARU ---
    { brand: "Suzuki", model: "Swift", version: "1.2 GLX Premium Hibrit", price_list: 1190000, price_campaign: 1160000, image_url: "https://www.suzuki.com.tr/assets/models/swift/swift.png", specs: { year: "2026", engine: "1.2 MHEV", transmission: "CVT", fuel: "Hibrit", power: "83 HP" } },
    { brand: "Suzuki", model: "Vitara", version: "1.4 MHEV GL Elegance 4x4", price_list: 1550000, price_campaign: 1550000, image_url: "https://www.suzuki.com.tr/assets/models/vitara/vitara.png", specs: { year: "2026", engine: "1.4 MHEV", transmission: "Otomatik", fuel: "Hibrit", power: "129 HP" } },
    { brand: "Subaru", model: "XV", version: "1.6i Xtreme", price_list: 1750000, price_campaign: 1750000, image_url: "https://www.subaru.com.tr/assets/models/xv/xv.png", specs: { year: "2026", engine: "1.6", transmission: "Lineartronic", fuel: "Benzin", power: "114 HP" } },

    // --- TOYOTA ---
    { brand: "Toyota", model: "Corolla", version: "1.5 Vision Plus Multidrive S", price_list: 1390000, price_campaign: 1390000, image_url: "https://www.toyota.com.tr/images/models/corolla/corolla.png", specs: { year: "2026", engine: "1.5", transmission: "CVT", fuel: "Benzin", power: "125 HP" } },
    { brand: "Toyota", model: "Corolla", version: "1.8 Hybrid Dream", price_list: 1650000, price_campaign: 1550000, image_url: "https://www.toyota.com.tr/images/models/corolla/corolla.png", specs: { year: "2026", engine: "1.8", transmission: "e-CVT", fuel: "Hibrit", power: "140 HP" } },
    { brand: "Toyota", model: "C-HR", version: "1.8 Hybrid Flame", price_list: 1890000, price_campaign: 1890000, image_url: "https://www.toyota.com.tr/images/models/chr/chr.png", specs: { year: "2026", engine: "1.8", transmission: "e-CVT", fuel: "Hibrit", power: "140 HP" } },

    // --- VOLKSWAGEN ---
    { brand: "Volkswagen", model: "Polo", version: "1.0 TSI Life DSG", price_list: 1250000, price_campaign: 1250000, image_url: "https://binekarac.vw.com.tr/assets/images/models/polo.png", specs: { year: "2026", engine: "1.0", transmission: "DSG", fuel: "Benzin", power: "95 HP" } },
    { brand: "Volkswagen", model: "Golf", version: "1.0 eTSI Style DSG", price_list: 1690000, price_campaign: 1690000, image_url: "https://binekarac.vw.com.tr/assets/images/models/golf.png", specs: { year: "2026", engine: "1.0 MHEV", transmission: "DSG", fuel: "Hibrit", power: "110 HP" } },
    { brand: "Volkswagen", model: "Golf", version: "1.5 eTSI R-Line DSG", price_list: 1950000, price_campaign: 1950000, image_url: "https://binekarac.vw.com.tr/assets/images/models/golf.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "DSG", fuel: "Hibrit", power: "150 HP" } },
    { brand: "Volkswagen", model: "T-Roc", version: "1.5 TSI R-Line DSG", price_list: 1850000, price_campaign: 1850000, image_url: "https://binekarac.vw.com.tr/assets/images/models/troc.png", specs: { year: "2026", engine: "1.5", transmission: "DSG", fuel: "Benzin", power: "150 HP" } },
    { brand: "Volkswagen", model: "Tiguan", version: "1.5 eTSI Elegance DSG", price_list: 2450000, price_campaign: 2450000, image_url: "https://binekarac.vw.com.tr/assets/images/models/tiguan.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "DSG", fuel: "Hibrit", power: "150 HP" } },

    // --- VOLVO ---
    { brand: "Volvo", model: "XC40", version: "Recharge Ultimate Single Motor", price_list: 2750000, price_campaign: 2750000, image_url: "https://www.volvocars.com/images/v/-/media/project/contentplatform/data/media/my24/xc40-bev/xc40-bev-hero.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "238 HP", range: "460 km" } },
    { brand: "Volvo", model: "XC60", version: "B4 AWD Plus Dark", price_list: 4150000, price_campaign: 4150000, image_url: "https://www.volvocars.com/images/v/-/media/project/contentplatform/data/media/my24/xc60/xc60-hero.png", specs: { year: "2026", engine: "2.0 MHEV", transmission: "Otomatik", fuel: "Hibrit", power: "197 HP" } },
    { brand: "Volvo", model: "EX30", version: "Ultra Single Motor ER", price_list: 2250000, price_campaign: 2250000, image_url: "https://www.volvocars.com/images/v/-/media/project/contentplatform/data/media/my24/ex30/ex30-hero.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "272 HP", range: "480 km" } },

    // --- HYUNDAI ---
    { brand: "Hyundai", model: "i20", version: "1.4 MPI Style", price_list: 1050000, price_campaign: 1010000, image_url: "https://www.hyundai.com/content/dam/hyundai/tr/tr/data/vehicles/i20/i20.png", specs: { year: "2026", engine: "1.4", transmission: "Otomatik", fuel: "Benzin", power: "100 HP" } },
    { brand: "Hyundai", model: "Tucson", version: "1.6 T-GDI Elite Plus 4x4", price_list: 2450000, price_campaign: 2450000, image_url: "https://www.hyundai.com/content/dam/hyundai/tr/tr/data/vehicles/tucson/tucson.png", specs: { year: "2026", engine: "1.6", transmission: "DCT", fuel: "Benzin", power: "180 HP" } },
    { brand: "Hyundai", model: "IONIQ 6", version: "Progressive Long Range AWD", price_list: 2950000, price_campaign: 2950000, image_url: "https://www.hyundai.com/content/dam/hyundai/tr/tr/data/vehicles/ioniq6/ioniq6.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "325 HP", range: "519 km" } },

    // --- ALFA ROMEO ---
    { brand: "Alfa Romeo", model: "Tonale", version: "1.5 VGT Veloce", price_list: 2650000, price_campaign: 2550000, image_url: "https://www.alfaromeo.com.tr/content/dam/alfa/cross/tonale/tonale.png", specs: { year: "2026", engine: "1.5 MHEV", transmission: "TCT", fuel: "Hibrit", power: "160 HP" } },
    { brand: "Alfa Romeo", model: "Giulia", version: "2.0 Veloce Q4", price_list: 4450000, price_campaign: 4450000, image_url: "https://www.alfaromeo.com.tr/content/dam/alfa/cross/giulia/giulia.png", specs: { year: "2026", engine: "2.0", transmission: "Otomatik", fuel: "Benzin", power: "280 HP" } },

    // --- RENAULT ---
    { brand: "Renault", model: "Clio", version: "1.0 TCe Techno Esprit Alpine", price_list: 1250000, price_campaign: 1200000, image_url: "https://www.renault.com.tr/CountriesData/Turkey_TR/images/cars/clio.png", specs: { year: "2026", engine: "1.0", transmission: "X-Tronic", fuel: "Benzin", power: "90 HP" } },
    { brand: "Renault", model: "Megane E-Tech", version: "Iconic 220hp", price_list: 1950000, price_campaign: 1950000, image_url: "https://www.renault.com.tr/CountriesData/Turkey_TR/images/cars/megane-e-tech.png", specs: { year: "2026", engine: "Elektrik", transmission: "Otomatik", fuel: "Elektrik", power: "220 HP", range: "450 km" } },
    { brand: "Renault", model: "Austral", version: "Mild Hybrid 160 hp Techno Esprit Alpine", price_list: 2150000, price_campaign: 2100000, image_url: "https://www.renault.com.tr/CountriesData/Turkey_TR/images/cars/austral.png", specs: { year: "2026", engine: "1.3 MHEV", transmission: "X-Tronic", fuel: "Hibrit", power: "160 HP" } }
];

async function updateDatabase() {
    console.log("Global Multi-Brand Ingestion Bot Calisiyor...");
    let db = { vehicles: [], lastUpdated: new Date().toISOString() };
    
    if (fs.existsSync(DB_PATH)) {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }

    let addedCount = 0;

    for (const car of megaKatalog) {
        // Zaten var mı kontrolü
        const exists = db.vehicles.some(v => v.brand === car.brand && v.model === car.model && v.version === car.version);
        if (!exists) {
            db.vehicles.push({
                id: `mega_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...car
            });
            addedCount++;
        }
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    
    console.log(`Tamamlandi! ${addedCount} yeni arac basariyla veritabanina eklendi.`);
    console.log(`Guncel toplam arac sayisi: ${db.vehicles.length}`);
}

updateDatabase();
