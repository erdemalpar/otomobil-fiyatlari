const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/data/vehicles.json', 'utf8'));

let nullCount = 0;
let totalCount = db.vehicles.length;
const missing = new Set();

db.vehicles.forEach(v => {
    if (!v.image_url || v.image_url.includes('placeholder') || v.image_url === '') {
        nullCount++;
        missing.add(`${v.brand}\t${v.model}`);
    }
});

console.log(`Total vehicles: ${totalCount}`);
console.log(`Missing images: ${nullCount}`);
console.log("Missing models:");
Array.from(missing).forEach(m => console.log(m));
