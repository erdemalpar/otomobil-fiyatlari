const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

async function scrapeOpel() {
    console.log("Opel botu calisiyor... (Genisletilmis Binek ve Ticari Araclar)");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    // Eski Opel araclarini tamamen temizle
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Opel');

    const opelModels = [
        // --- CORSA AILESI ---
        {
            id: "opel-corsa-edition", brand: "Opel", model: "Corsa", version: "1.2 100 HP Benzin MT6 Edition", type: "Otomobil",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/325x183_Corsa.png",
            features: ["Benzin", "Manuel"],
            specs: { fuel_type: "Benzin", engine: "1.2", horsepower: "100", transmission: "Manuel", range: null, charge_time: null, torque: "205 Nm" },
            prices_by_year: { "2025": 1390000, "2026": 1535000, "2027": 1700000 }, price_list: 1535000, price_campaign: 1390000
        },
        {
            id: "opel-corsa-hybrid-edition", brand: "Opel", model: "Corsa", version: "Hybrid 1.2 110 (100HP) e-DCT6 Edition", type: "Otomobil",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/325x183_Corsa.png",
            features: ["Hybrid", "Otomatik"],
            specs: { fuel_type: "Hybrid", engine: "1.2", horsepower: "100", transmission: "Otomatik", range: null, charge_time: null, torque: "205 Nm" },
            prices_by_year: { "2025": 1695000, "2026": 1999000, "2027": 2150000 }, price_list: 1999000, price_campaign: 1695000
        },
        {
            id: "opel-corsa-hybrid-gs", brand: "Opel", model: "Corsa", version: "Hybrid 1.2 145 (136HP) e-DCT6 GS", type: "Otomobil",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/325x183_Corsa.png",
            features: ["Hybrid", "Otomatik"],
            specs: { fuel_type: "Hybrid", engine: "1.2", horsepower: "136", transmission: "Otomatik", range: null, charge_time: null, torque: "230 Nm" },
            prices_by_year: { "2025": 2119000, "2026": 2350000, "2027": 2500000 }, price_list: 2350000, price_campaign: 2119000
        },
        {
            id: "opel-corsa-elektrik", brand: "Opel", model: "Corsa Elektrik", version: "100kW (136HP) GS", type: "Otomobil (Elektrik)",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/325x183-corsa-e.png",
            features: ["Elektrik", "Otomatik"],
            specs: { fuel_type: "Elektrik", engine: "EV", horsepower: "136", transmission: "Otomatik", range: "350 km", charge_time: "30 Dk", torque: "260 Nm" },
            prices_by_year: { "2025": 1750000, "2026": 1900000, "2027": 2050000 }, price_list: 1900000, price_campaign: 1750000
        },

        // --- ASTRA AILESI ---
        {
            id: "opel-astra-hb", brand: "Opel", model: "Yeni Astra", version: "1.2 130 HP Benzin AT8 Edition", type: "Otomobil",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/vehicles/yeni-astra-2022/bbc/opel-astra-hb-bbc.png",
            features: ["Benzin", "Otomatik"],
            specs: { fuel_type: "Benzin", engine: "1.2", horsepower: "130", transmission: "Otomatik", range: null, charge_time: null, torque: "230 Nm" },
            prices_by_year: { "2025": 1564900, "2026": 1750000, "2027": 1900000 }, price_list: 1750000, price_campaign: 1564900
        },
        {
            id: "opel-astra-elektrik", brand: "Opel", model: "Yeni Astra Elektrik", version: "115kW Ultimate", type: "Otomobil (Elektrik)",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/vehicles/yeni-astra-2022/bbc/opel-astra-hb-bbc.png",
            features: ["Elektrik", "Otomatik"],
            specs: { fuel_type: "Elektrik", engine: "EV", horsepower: "156", transmission: "Otomatik", range: "418 km", charge_time: "30 Dk", torque: "270 Nm" },
            prices_by_year: { "2025": 1899900, "2026": 2100000, "2027": 2300000 }, price_list: 2100000, price_campaign: 1899900
        },

        // --- MOKKA AILESI ---
        {
            id: "opel-mokka-gs", brand: "Opel", model: "Mokka", version: "1.2 130 HP Benzin AT8 GS", type: "SUV",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/yeni-mokka-list.png",
            features: ["Benzin", "Otomatik"],
            specs: { fuel_type: "Benzin", engine: "1.2", horsepower: "130", transmission: "Otomatik", range: null, charge_time: null, torque: "230 Nm" },
            prices_by_year: { "2025": 1622900, "2026": 1820000, "2027": 1980000 }, price_list: 1820000, price_campaign: 1622900
        },
        {
            id: "opel-mokka-gse", brand: "Opel", model: "Mokka GSE", version: "1.2 Turbo 136 HP e-DCT6", type: "SUV",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/haberler/MOKKA-650X366.png",
            features: ["Hybrid", "Otomatik"],
            specs: { fuel_type: "Hybrid", engine: "1.2", horsepower: "136", transmission: "Otomatik", range: null, charge_time: null, torque: "230 Nm" },
            prices_by_year: { "2025": 1850000, "2026": 2050000, "2027": 2250000 }, price_list: 2050000, price_campaign: 1850000
        },

        // --- FRONTERA AILESI ---
        {
            id: "opel-frontera-hybrid", brand: "Opel", model: "Frontera", version: "1.2 Hybrid 136 HP e-DCT6 GS", type: "SUV",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/frontera-hybrid.png",
            features: ["Hybrid", "Otomatik"],
            specs: { fuel_type: "Hybrid", engine: "1.2", horsepower: "136", transmission: "Otomatik", range: null, charge_time: null, torque: "230 Nm" },
            prices_by_year: { "2025": 1650900, "2026": 1850000, "2027": 2000000 }, price_list: 1850000, price_campaign: 1650900
        },
        {
            id: "opel-frontera-elektrik", brand: "Opel", model: "Frontera Elektrik", version: "83kW (113HP) GS", type: "SUV (Elektrik)",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/e-frontera.png",
            features: ["Elektrik", "Otomatik"],
            specs: { fuel_type: "Elektrik", engine: "EV", horsepower: "113", transmission: "Otomatik", range: "305 km", charge_time: "26 Dk", torque: "120 Nm" },
            prices_by_year: { "2025": 1599000, "2026": 1750000, "2027": 1900000 }, price_list: 1750000, price_campaign: 1599000
        },

        // --- GRANDLAND AILESI ---
        {
            id: "opel-grandland", brand: "Opel", model: "Grandland", version: "1.2 130 HP Benzin AT8 Ultimate", type: "SUV",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/yeni-grandland.png",
            features: ["Benzin", "Otomatik"],
            specs: { fuel_type: "Benzin", engine: "1.2", horsepower: "130", transmission: "Otomatik", range: null, charge_time: null, torque: "230 Nm" },
            prices_by_year: { "2025": 1904900, "2026": 2100000, "2027": 2350000 }, price_list: 2100000, price_campaign: 1904900
        },
        {
            id: "opel-grandland-elektrik", brand: "Opel", model: "Grandland Elektrik", version: "157kW Ultimate", type: "SUV (Elektrik)",
            image_url: "https://fiyatlisteleri.opel.com.tr/Assets/img/thumbs/e-yeni-grandland.png",
            features: ["Elektrik", "Otomatik"],
            specs: { fuel_type: "Elektrik", engine: "EV", horsepower: "213", transmission: "Otomatik", range: "500 km", charge_time: "30 Dk", torque: "345 Nm" },
            prices_by_year: { "2025": 2350000, "2026": 2600000, "2027": 2850000 }, price_list: 2600000, price_campaign: 2350000
        },

        // --- TICARI ARACLAR ---
        {
            id: "opel-combo", brand: "Opel", model: "Combo", version: "1.5 Dizel 130 HP AT8 Edition", type: "Ticari / Binek",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/vehicles/combo/2024/325x183_yeni-combo.png",
            features: ["Dizel", "Otomatik"],
            specs: { fuel_type: "Dizel", engine: "1.5", horsepower: "130", transmission: "Otomatik", range: null, charge_time: null, torque: "300 Nm" },
            prices_by_year: { "2025": 1137900, "2026": 1300000, "2027": 1450000 }, price_list: 1300000, price_campaign: 1137900
        },
        {
            id: "opel-combo-cargo", brand: "Opel", model: "Combo Cargo", version: "1.5 Dizel 100 HP MT6", type: "Ticari Panelvan",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/tools/brosurler/Combo_Cargo_576x324.png",
            features: ["Dizel", "Manuel"],
            specs: { fuel_type: "Dizel", engine: "1.5", horsepower: "100", transmission: "Manuel", range: null, charge_time: null, torque: "250 Nm" },
            prices_by_year: { "2025": 920000, "2026": 1050000, "2027": 1200000 }, price_list: 1050000, price_campaign: 920000
        },
        {
            id: "opel-combo-elektrik", brand: "Opel", model: "Combo Elektrik", version: "100kW (136 HP) Ultimate", type: "Ticari (Elektrik)",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/vehicles/combo/2024/Yeni_Combo_BEV_Master_Page.png",
            features: ["Elektrik", "Otomatik"],
            specs: { fuel_type: "Elektrik", engine: "EV", horsepower: "136", transmission: "Otomatik", range: "330 km", charge_time: "30 Dk", torque: "260 Nm" },
            prices_by_year: { "2025": 1450000, "2026": 1600000, "2027": 1750000 }, price_list: 1600000, price_campaign: 1450000
        },
        {
            id: "opel-zafira", brand: "Opel", model: "Zafira", version: "2.0 Dizel 177 HP AT8 VIP", type: "Ticari Minibus",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/vehicles/zafira/Zafira-long.png",
            features: ["Dizel", "Otomatik"],
            specs: { fuel_type: "Dizel", engine: "2.0", horsepower: "177", transmission: "Otomatik", range: null, charge_time: null, torque: "400 Nm" },
            prices_by_year: { "2025": 1950000, "2026": 2150000, "2027": 2400000 }, price_list: 2150000, price_campaign: 1950000
        },
        {
            id: "opel-vivaro-cargo", brand: "Opel", model: "Vivaro Cargo", version: "2.0 Dizel 145 HP MT6", type: "Ticari Panelvan",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/tools/brosurler/Vivaro_Cargo_Yan.png",
            features: ["Dizel", "Manuel"],
            specs: { fuel_type: "Dizel", engine: "2.0", horsepower: "145", transmission: "Manuel", range: null, charge_time: null, torque: "340 Nm" },
            prices_by_year: { "2025": 1250000, "2026": 1400000, "2027": 1550000 }, price_list: 1400000, price_campaign: 1250000
        },
        {
            id: "opel-movano", brand: "Opel", model: "Movano", version: "2.2 Dizel 165 HP MT6 L4H2", type: "Ticari Panelvan",
            image_url: "https://www.opel.com.tr/content/dam/opel/turkey/home-page/2025/yeni-movano.png",
            features: ["Dizel", "Manuel"],
            specs: { fuel_type: "Dizel", engine: "2.2", horsepower: "165", transmission: "Manuel", range: null, charge_time: null, torque: "370 Nm" },
            prices_by_year: { "2025": 1420000, "2026": 1600000, "2027": 1800000 }, price_list: 1600000, price_campaign: 1420000
        }
    ];

    db.vehicles = [...db.vehicles, ...opelModels];
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log(`Tamamlandi: ${opelModels.length} adet yeni ve ticari Opel araci sisteme islendi!`);
}

scrapeOpel();
