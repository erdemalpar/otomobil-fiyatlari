const fs = require('fs');
const https = require('https');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const fetchFordAPI = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
};

const endpoints = [
    "https://www.ford.com.tr/fwebapi/main/carPriceListNewUI?searchparam=&cartype=Binek",
    "https://www.ford.com.tr/fwebapi/main/carPriceListNewUI?searchparam=&cartype=Ticari",
    "https://www.ford.com.tr/fwebapi/main/carPriceListNewUI?searchparam=&cartype=FordStore"
];

(async () => {
    console.log("Starting Ford API scraper...");
    const scrapedCars = [];
    
    for (const endpoint of endpoints) {
        console.log("Fetching: " + endpoint.split('cartype=')[1]);
        const data = await fetchFordAPI(endpoint);
        if (data && data.carPriceList) {
            data.carPriceList.forEach(model => {
                const modelName = model.modelName.trim();
                let imgUrl = model.image;
                if (imgUrl && imgUrl.startsWith('/')) {
                    imgUrl = 'https://www.ford.com.tr' + imgUrl;
                }
                
                const carType = model.carType === "Ticari" ? "Ticari" : (model.carType === "Binek" ? "İçten Yanmalı" : "İçten Yanmalı");

                if (model.entities && model.entities.length > 0) {
                    model.entities.forEach(ent => {
                        // We need a valid price to list the car
                        const listPriceRaw = ent.deliveredTurnkeyListPrice || ent.campaignedTurnkeyPrice;
                        if (!listPriceRaw) return;
                        
                        const price = parseInt(listPriceRaw, 10);
                        if (isNaN(price) || price === 0) return;

                        const campaignPriceRaw = ent.campaignedTurnkeyPrice || ent.deliveredTurnkeyListPrice;
                        const campaignPrice = parseInt(campaignPriceRaw, 10);

                        const year = ent.modelYear || "2024";
                        const series = ent.series ? ent.series.trim() : "";
                        const engine = ent.engine ? ent.engine.trim() : "";
                        const desc = ent.entityDescription ? ent.entityDescription.split(',')[0].trim() : "";
                        
                        // Construct a clear version name
                        // e.g. "2025 Titanium - 1.0L EcoBoost"
                        let versionParts = [];
                        versionParts.push(year);
                        if (series) versionParts.push(series);
                        if (engine) {
                            versionParts.push("-");
                            versionParts.push(engine);
                        } else if (desc && desc !== series) {
                            versionParts.push("-");
                            versionParts.push(desc);
                        }
                        const version = versionParts.join(" ").replace(/ - - /g, " - ");

                        const fuel = ent.fuelType || "Benzin";
                        const gear = ent.gearbox || "Manuel";
                        let type = carType;
                        if (fuel.toLowerCase().includes('elektrik')) type = 'Elektrikli';

                        const id = `ford-${modelName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${version.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${price}`;

                        scrapedCars.push({
                            id: id,
                            brand: "Ford",
                            model: modelName,
                            version: version,
                            type: type,
                            price_list: price,
                            price_campaign: campaignPrice,
                            image_url: imgUrl,
                            features: [gear, fuel, year]
                        });
                    });
                }
            });
        }
    }
    
    if (scrapedCars.length > 0) {
        // Remove old static Ford vehicles
        const oldLength = db.vehicles.length;
        db.vehicles = db.vehicles.filter(v => v.brand !== 'Ford');
        const removed = oldLength - db.vehicles.length;
        
        // Add new unique ones (sometimes APIs return duplicates across categories)
        const uniqueIds = new Set();
        let addedCount = 0;
        
        scrapedCars.forEach(car => {
            if (!uniqueIds.has(car.id)) {
                uniqueIds.add(car.id);
                db.vehicles.push(car);
                addedCount++;
            }
        });

        db.lastUpdated = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
        
        console.log(`Removed ${removed} old Ford cars.`);
        console.log(`Added ${addedCount} new dynamic Ford cars with all years/trim options.`);
    } else {
        console.log("No cars were scraped. Check API response.");
    }
})();
