const fs = require('fs');
const dataPath = 'public/data/vehicles.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
let nullCount = 0;
data.vehicles.forEach(v => {
    if (!v.image_url || v.image_url.includes("BMW_N20")) {
        nullCount++;
    }
});
console.log(`Null images remaining: ${nullCount}/${data.vehicles.length}`);
