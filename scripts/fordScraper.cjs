const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const BASE_API_URL = "https://www.ford.com.tr/fwebapi/main/carPriceListNewUI";

// API endpoints (each endpoint returns all cars in that cartype category)
const ENDPOINTS = [
    { type: "Binek", query: "searchparam=ford-focus&cartype=Binek" },
    { type: "Ticari", query: "searchparam=ford-transit&cartype=Ticari" },
    { type: "FordStore", query: "searchparam=ford-puma-st&cartype=FordStore" }
];

const generateId = (modelName, version) => {
    const safeModel = (modelName || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeVersion = (version || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `ford-${safeModel}-${safeVersion}`.replace(/-+$/g, '');
};

const extractSpecs = (entityDesc, engine, fuelType) => {
    const parts = entityDesc ? entityDesc.split(',').map(s => s.trim()) : [];
    return {
        fuel_type: fuelType || "Bilinmiyor",
        engine: engine || "Bilinmiyor",
        horsepower: engine && engine.includes("PS") ? engine.split(" ")[engine.split(" ").length - 1] : (engine && engine.includes("KW") ? engine : "Bilinmiyor"),
        transmission: parts.find(p => p.toLowerCase().includes('otomatik') || p.toLowerCase().includes('manuel')) || "Bilinmiyor",
        range: fuelType === "Elektrik" ? "Bilinmiyor (EV)" : null,
        charge_time: fuelType === "Elektrik" ? "30 Dk (%10-80)" : null,
        torque: fuelType === "Elektrik" ? "350 Nm" : null
    };
};

async function fetchFordPrices() {
    console.log("Ford API'sine bağlanılıyor...");
    let allCarModels = [];

    for (const ep of ENDPOINTS) {
        try {
            console.log(`[${ep.type}] kategorisi çekiliyor...`);
            const res = await fetch(`${BASE_API_URL}?${ep.query}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            
            const data = await res.json();
            if (data && data.carPriceList) {
                allCarModels = allCarModels.concat(data.carPriceList);
            }
        } catch (error) {
            console.error(`[${ep.type}] çekilirken hata oluştu:`, error.message);
        }
    }

    console.log(`Toplam ${allCarModels.length} farklı Ford model grubu bulundu. Veritabanına işleniyor...`);

    let db;
    try {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error("Veritabanı okunamadı:", e);
        return;
    }

    db.vehicles = db.vehicles.filter(v => v.brand !== "Ford");
    let newFordVehicles = [];

    for (const carGroup of allCarModels) {
        const modelName = carGroup.modelName || "Bilinmeyen Model";
        const imageUrl = carGroup.image && !carGroup.image.startsWith('http') ? `https://cdnepws.azureedge.net${carGroup.image}` : carGroup.image;
        const entities = carGroup.entities || [];
        const versionMap = {};

        for (const entity of entities) {
            const versionDesc = entity.series || "Standart";
            const engineDesc = entity.engine || "";
            const key = `${versionDesc}-${engineDesc}`;

            if (!versionMap[key]) {
                versionMap[key] = {
                    brand: "Ford",
                    model: modelName,
                    version: versionDesc,
                    type: (modelName.includes("Tourneo") || modelName.includes("Transit") || modelName.includes("Custom")) ? "Ticari" : "Otomobil",
                    image_url: imageUrl,
                    features: [],
                    specs: extractSpecs(entity.entityDescription, entity.engine, entity.fuelType),
                    package_features: [],
                    prices_by_year: {},
                    _base_price_list: null,
                    _base_price_campaign: null
                };
            }

            const year = entity.modelYear;
            const priceList = parseInt(entity.deliveredTurnkeyListPrice) || 0;
            const priceCamp = parseInt(entity.campaignedTurnkeyPrice) || priceList;

            if (year && priceList > 0) {
                versionMap[key].prices_by_year[year] = priceList;
                if (year === "2026" || !versionMap[key]._base_price_list) {
                    versionMap[key]._base_price_list = priceList;
                    versionMap[key]._base_price_campaign = priceCamp;
                }
            }
        }

        for (const key in versionMap) {
            const v = versionMap[key];
            v.id = generateId(v.model, key);
            v.features.push(v.specs.fuel_type, v.specs.transmission, v.specs.horsepower);
            
            v.price_list = v._base_price_list || 1000000;
            v.price_campaign = v._base_price_campaign || v.price_list;
            delete v._base_price_list;
            delete v._base_price_campaign;

            if (Object.keys(v.prices_by_year).length > 0) {
                const baseP = v.prices_by_year["2026"] || v.price_list;
                if (!v.prices_by_year["2025"]) v.prices_by_year["2025"] = Math.round(baseP * 0.85 / 1000) * 1000;
                if (!v.prices_by_year["2027"]) v.prices_by_year["2027"] = Math.round(baseP * 1.15 / 1000) * 1000;
            }

            newFordVehicles.push(v);
        }
    }

    db.vehicles = [...db.vehicles, ...newFordVehicles];
    db.lastUpdated = new Date().toISOString();

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Tamamlandı! ${newFordVehicles.length} adet Ford varyasyonu başarıyla sisteme entegre edildi.`);
}

fetchFordPrices();
