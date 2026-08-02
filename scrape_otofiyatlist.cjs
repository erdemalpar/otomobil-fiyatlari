const https = require('https');
const fs = require('fs');

const dataPath = 'public/data/vehicles.json';

const fetchAPI = (url) => {
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

(async () => {
    console.log("Fetching data from OtoFiyatList API...");
    const data = await fetchAPI('https://api.otofiyatlist.com/api/v1/latest');
    
    if (!data || !data.brands) {
        console.log("Failed to fetch or parse API data.");
        process.exit(1);
    }
    
    let newVehicles = [];
    
    for (const brandKey in data.brands) {
        const brandObj = data.brands[brandKey];
        const brandName = brandObj.name;
        
        if (brandObj.vehicles && Array.isArray(brandObj.vehicles)) {
            brandObj.vehicles.forEach(v => {
                const model = v.model || "";
                const trim = v.trim || "";
                const engine = v.engine || "";
                
                const version = `${trim} ${engine}`.trim();
                const type = v.isElectric ? "Elektrikli" : (v.isHybrid || v.isMildHybrid ? "Hibrit" : "İçten Yanmalı");
                const price = v.priceNumeric || 0;
                
                // Atla eğer fiyat yoksa
                if (price === 0) return;

                const features = [];
                if (v.transmission) features.push(v.transmission);
                if (v.fuel) features.push(v.fuel);

                const specs = {};
                if (v.powerHP) specs.horsepower = String(v.powerHP);
                if (v.rangeWLTP) specs.range = String(v.rangeWLTP);
                if (v.engineDisplacement) specs.engineDisplacement = v.engineDisplacement;
                if (v.fuelConsumption) specs.fuelConsumption = v.fuelConsumption;

                const id = `ofl-${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${version.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                
                newVehicles.push({
                    id: id,
                    brand: brandName,
                    model: model,
                    version: version,
                    type: type,
                    price_list: price,
                    price_campaign: price, // API only gives priceNumeric
                    image_url: null, // OtoFiyatList doesn't have images
                    features: features,
                    specs: specs
                });
            });
        }
    }
    
    console.log(`Parsed ${newVehicles.length} vehicles from OtoFiyatList.`);
    
    if (newVehicles.length > 0) {
        const db = {
            lastUpdated: data.generatedAt || new Date().toISOString(),
            vehicles: newVehicles
        };
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
        console.log("Successfully overwrited vehicles.json with OtoFiyatList data.");
    }
})();
