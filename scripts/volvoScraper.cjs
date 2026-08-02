const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

// KULLANICININ İLETTİĞİ MY26 (2026) ve MY27 (2027) "TAVSİYE EDİLEN ANAHTAR TESLİM FİYAT (TL)" VERİLERİ
const VOLVO_CATALOG = [
    { model: "EX30", version: "Twin Motor Ultra", price: 3619314, price2027: null, type: "SUV", fuel: "Elektrik", trans: "Otomatik", image: "" },
    { model: "EX30", version: "Cross Country Twin Motor Perf. Ultra", price: 3758544, price2027: null, type: "SUV", fuel: "Elektrik", trans: "Otomatik", image: "" },
    { model: "EX30", version: "Single Motor Extended Range Ultra", price: null, price2027: 2436910, type: "SUV", fuel: "Elektrik", trans: "Otomatik", image: "" },
    { model: "EX40", version: "Single Motor Extended Range Ultra", price: 3925994, price2027: 4317300, type: "SUV", fuel: "Elektrik", trans: "Otomatik", image: "" },
    { model: "EX40", version: "Black Edition Single Motor Ultra", price: null, price2027: 4456800, type: "SUV", fuel: "Elektrik", trans: "Otomatik", image: "" },
    { model: "EC40", version: "Single Motor Extended Range Ultra", price: null, price2027: 4409184, type: "SUV", fuel: "Elektrik", trans: "Otomatik", image: "" },
    { model: "V60", version: "B4 FWD Mild hybrid Plus Dark", price: 5478326, price2027: 5958559, type: "Otomobil", fuel: "M-Hibrit", trans: "Otomatik", image: "" },
    { model: "XC60", version: "B5 AWD Mild hybrid Plus Dark", price: 6703921, price2027: null, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", image: "" },
    { model: "XC60", version: "B5 AWD Mild hybrid Plus Bright", price: null, price2027: 7292014, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", image: "" },
    { model: "XC60", version: "Black Edition B5 AWD Mild hybrid Plus", price: null, price2027: 7700254, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", image: "" },
    { model: "XC60", version: "T8 AWD Plug-in hybrid Plus Bright/Dark", price: null, price2027: 7965934, type: "SUV", fuel: "Plug-in Hibrit", trans: "Otomatik", image: "" },
    { model: "XC60", version: "T8 AWD Plug-in hybrid Polestar Engineered", price: 8562061, price2027: 9189034, type: "SUV", fuel: "Plug-in Hibrit", trans: "Otomatik", image: "" },
    { model: "XC90", version: "B5 AWD Mild hybrid Plus Bright", price: 10594384, price2027: 11123054, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", image: "" },
    { model: "XC90", version: "Black Edition B5 AWD Mild hybrid", price: null, price2027: 11351474, type: "SUV", fuel: "M-Hibrit", trans: "Otomatik", image: "" },
    { model: "XC90", version: "T8 AWD Plug-in hybrid Plus Bright", price: 11255344, price2027: 11796974, type: "SUV", fuel: "Plug-in Hibrit", trans: "Otomatik", image: "" }
];

async function updateVolvoData() {
    console.log("Volvo araclari hem 2026 hem 2027 fiyatlariyla veritabanina yaziliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let added = 0;
    
    // Eski Volvo verilerini sil
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Volvo');
    
    VOLVO_CATALOG.forEach(car => {
        const id = `volvo-${car.model}-${car.version}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        let pricesObj = {};
        if (car.price !== null) pricesObj["2026"] = car.price;
        if (car.price2027 !== null) pricesObj["2027"] = car.price2027;

        // Eger ana fiyat null ise 2027 fiyatini varsayilan al (kampanya gosterimi icin)
        let mainPrice = car.price || car.price2027;
        
        const vehicle = {
            id: id,
            brand: "Volvo",
            model: car.model,
            version: car.version,
            type: car.type,
            price_list: mainPrice, 
            price_campaign: mainPrice,
            image_url: car.image,
            features: [car.fuel, car.trans],
            specs: { engine: "Bilinmiyor", fuel_type: car.fuel, transmission: car.trans },
            package_features: [],
            prices_by_year: pricesObj
        };
        db.vehicles.push(vehicle);
        added++;
    });

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Tamamlandi! ${added} adet Volvo otomobili Cift Yil (2026-2027) Fiyatlariyla eklendi.`);
}

updateVolvoData();
