const fs = require('fs');

const dataPath = 'public/data/vehicles.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let updated = 0;
data.vehicles.forEach(vehicle => {
    if (vehicle.brand === 'Togg') {
        if (vehicle.id.includes('t10x')) {
            vehicle.image_url = "https://www.togg.com.tr/assets/img/670514f502a2b45aa546007c_T10X-Smart-Device.webp";
            updated++;
        } else if (vehicle.id.includes('t10f')) {
            vehicle.image_url = "https://www.togg.com.tr/assets/img/68cd40855cc5b3b63d149fb2_t10f-version-features-section.webp";
            updated++;
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updated} Togg vehicles.`);
