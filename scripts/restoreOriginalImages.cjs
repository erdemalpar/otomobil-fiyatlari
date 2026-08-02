const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const scraperFiles = [
    path.join(__dirname, 'megaBrandScraper.cjs'),
    path.join(__dirname, 'megaBrandScraper2.cjs')
];

const mappings = {};

console.log("🔥 Orjinal Scraper CDN verileri aranıyor...");

// Regex ile .cjs dosyalarının içinden marka, model ve image_url alanlarını çekelim
scraperFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
            if (line.includes('brand:') && line.includes('image_url:')) {
                const brandMatch = line.match(/brand:\s*"([^"]+)"/);
                const modelMatch = line.match(/model:\s*"([^"]+)"/);
                const imgMatch = line.match(/image_url:\s*"([^"]+)"/);
                
                if (brandMatch && modelMatch && imgMatch) {
                    // Marka ve Modeli birleştirerek benzersiz key oluşturalım
                    const key = `${brandMatch[1].trim()}_${modelMatch[1].trim()}`;
                    mappings[key] = imgMatch[1].trim();
                }
            }
        });
    }
});

console.log(`${Object.keys(mappings).length} farklı araç için %100 Orijinal CDN Linki bulundu.`);

let count = 0;
let emptyCount = 0;

db.vehicles.forEach(v => {
    const key = `${v.brand.trim()}_${v.model.trim()}`;
    
    if (mappings[key]) {
        v.image_url = mappings[key];
        count++;
    } else {
        // Orijinal CDN verisi yoksa, alakasız/yanlış arama motoru çöplerinden kurtulmak için resmi siliyoruz (null).
        // Böylece kartta sadece tertemiz arkaplan görünecek, yanlış bilgi veya saçma bir resim olmayacak.
        v.image_url = null;
        emptyCount++;
    }
});

db.lastUpdated = new Date().toISOString();
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`\n🏆 İŞLEM BAŞARILI!`);
console.log(`- ${count} aracın resmi orijinal CDN kaynağıyla düzeltildi.`);
console.log(`- ${emptyCount} aracın hatalı resmi silinerek temizlendi.`);
