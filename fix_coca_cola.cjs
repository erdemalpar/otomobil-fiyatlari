const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/data/vehicles.json', 'utf8'));

db.vehicles.forEach(v => {
    if (v.image_url && (v.image_url.includes('Coca_Cola') || v.image_url.includes('FIFA') || v.image_url.includes('map') || v.image_url.includes('lama.jpg'))) {
        v.image_url = null;
    }
});

fs.writeFileSync('public/data/vehicles.json', JSON.stringify(db, null, 2));
console.log('Cleaned bad images.');
