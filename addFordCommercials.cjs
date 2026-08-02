const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'data', 'vehicles.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newVehicles = [
    {
        id: "ford-ranger-xlt-mt",
        brand: "Ford",
        model: "Ranger",
        version: "XLT 2.0L EcoBlue 170PS 4x4",
        type: "Ticari",
        features: ["Dizel", "Manuel", "4x4", "Pick-up"],
        price_list: 3969000,
        price_campaign: 3969000,
        prices_by_year: { "2025": 3600000, "2026": 3969000, "2027": 4350000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/2019_Ford_Ranger_Wildtrak_4x4_Double_Cab_3.2.jpg",
        specs: { horsepower: "170", acceleration: "11.5", range: "600", fuel_consumption: "7.8" },
        package_features: ["6 İleri Manuel", "XLT Donanım"]
    },
    {
        id: "ford-ranger-xlt-at",
        brand: "Ford",
        model: "Ranger",
        version: "XLT 2.0L EcoBlue 170PS 4x4 Oto",
        type: "Ticari",
        features: ["Dizel", "Otomatik", "4x4", "Pick-up"],
        price_list: 4247700,
        price_campaign: 4247700,
        prices_by_year: { "2025": 4000000, "2026": 4247700, "2027": 4500000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/2019_Ford_Ranger_Wildtrak_4x4_Double_Cab_3.2.jpg",
        specs: { horsepower: "170", acceleration: "11.0", range: "580", fuel_consumption: "8.1" },
        package_features: ["6 İleri Otomatik", "XLT Donanım"]
    },
    {
        id: "ford-ranger-wildtrak-205",
        brand: "Ford",
        model: "Ranger",
        version: "Wildtrak 2.0L EcoBlue 205PS 4x4",
        type: "Ticari",
        features: ["Dizel", "Otomatik", "4x4", "Pick-up"],
        price_list: 4889700,
        price_campaign: 4889700,
        prices_by_year: { "2025": 4500000, "2026": 4889700, "2027": 5200000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/2019_Ford_Ranger_Wildtrak_4x4_Double_Cab_3.2.jpg",
        specs: { horsepower: "205", acceleration: "9.8", range: "550", fuel_consumption: "8.5" },
        package_features: ["10 İleri Otomatik", "Wildtrak Donanım"]
    },
    {
        id: "ford-ranger-wildtrak-x",
        brand: "Ford",
        model: "Ranger",
        version: "Wildtrak X 2.0L EcoBlue 205PS 4x4",
        type: "Ticari",
        features: ["Dizel", "Otomatik", "4x4", "Pick-up"],
        price_list: 5173800,
        price_campaign: 5173800,
        prices_by_year: { "2025": 4800000, "2026": 5173800, "2027": 5500000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/2019_Ford_Ranger_Wildtrak_4x4_Double_Cab_3.2.jpg",
        specs: { horsepower: "205", acceleration: "9.5", range: "540", fuel_consumption: "8.6" },
        package_features: ["10 İleri Otomatik", "Wildtrak X Donanım"]
    },
    {
        id: "ford-ranger-wildtrak-240",
        brand: "Ford",
        model: "Ranger",
        version: "Wildtrak 3.0L EcoBlue 240PS 4x4",
        type: "Ticari",
        features: ["Dizel", "Otomatik", "4x4", "Pick-up"],
        price_list: 5445600,
        price_campaign: 5445600,
        prices_by_year: { "2025": 5100000, "2026": 5445600, "2027": 5800000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/2019_Ford_Ranger_Wildtrak_4x4_Double_Cab_3.2.jpg",
        specs: { horsepower: "240", acceleration: "8.5", range: "500", fuel_consumption: "9.2" },
        package_features: ["10 İleri Otomatik", "Wildtrak V6 Donanım"]
    },
    {
        id: "ford-tourneo-courier",
        brand: "Ford",
        model: "Tourneo Courier",
        version: "Titanium 1.0L EcoBoost 100PS",
        type: "Ticari",
        features: ["Benzin", "Manuel", "Camlı Van"],
        price_list: 1199000,
        price_campaign: 1150000,
        prices_by_year: { "2025": 1050000, "2026": 1199000, "2027": 1350000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/2018_Ford_Tourneo_Courier_Zetec_1.0.jpg/1200px-2018_Ford_Tourneo_Courier_Zetec_1.0.jpg",
        specs: { horsepower: "100", acceleration: "12.5", range: "750", fuel_consumption: "6.2" },
        package_features: ["6 İleri Manuel", "Titanium Donanım"]
    },
    {
        id: "ford-transit-courier",
        brand: "Ford",
        model: "Transit Courier",
        version: "Trend 1.5L EcoBlue 100PS",
        type: "Ticari",
        features: ["Dizel", "Manuel", "Panelvan"],
        price_list: 1085000,
        price_campaign: 1040000,
        prices_by_year: { "2025": 950000, "2026": 1085000, "2027": 1200000 },
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/2019_Ford_Transit_Courier_Base_1.5.jpg/1200px-2019_Ford_Transit_Courier_Base_1.5.jpg",
        specs: { horsepower: "100", acceleration: "13.2", range: "800", fuel_consumption: "5.5" },
        package_features: ["6 İleri Manuel", "Trend Donanım"]
    }
];

// Check if already added to prevent duplicates during multiple runs
const existingIds = db.vehicles.map(v => v.id);
const toAdd = newVehicles.filter(nv => !existingIds.includes(nv.id));

if (toAdd.length > 0) {
    db.vehicles = [...db.vehicles, ...toAdd];
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Successfully added ${toAdd.length} commercial Ford vehicles!`);
} else {
    console.log("Vehicles already exist in the database.");
}
