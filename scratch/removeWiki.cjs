const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, '../scripts');
const files = fs.readdirSync(scriptsDir);

let matchCount = 0;

files.forEach(file => {
    if (file.endsWith('.cjs')) {
        const filePath = path.join(scriptsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Regex ile tırnak içindeki wiki linklerini bul ve içini boşalt.
        // Örn: image_url: "https://upload.wikimedia..." -> image_url: ""
        const regex = /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^"']+/g;
        
        if (regex.test(content)) {
            const matches = content.match(regex).length;
            matchCount += matches;
            
            // Linkleri boş string ile degistiriyoruz ki bundan sonra Scraperlar calisinca resim atamasin.
            // Asil resim atama isini googleImagePatcher yapacak.
            content = content.replace(regex, '');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[TEMIZLENDI] ${file} icerisindeki ${matches} adet Wikipedia linki kaldirildi.`);
        }
    }
});

// VehicleCard.jsx icindeki fallback wiki resmini kaldirma
const vcPath = path.join(__dirname, '../src/components/VehicleCard.jsx');
if (fs.existsSync(vcPath)) {
    let vcContent = fs.readFileSync(vcPath, 'utf8');
    const regexVC = /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^"']+/g;
    if (regexVC.test(vcContent)) {
        const matches = vcContent.match(regexVC).length;
        matchCount += matches;
        // Karta resim yuklenemezse Google yerine basit bir yerel placeholder araba ikonu veya bos URL verelim:
        vcContent = vcContent.replace(regexVC, 'https://cdn-icons-png.flaticon.com/512/3204/3204005.png'); 
        fs.writeFileSync(vcPath, vcContent, 'utf8');
        console.log(`[TEMIZLENDI] VehicleCard.jsx icerisindeki ${matches} adet Wikipedia linki kaldirildi.`);
    }
}

console.log(`\n✅ Islem Tamamlandi! Projede toplam ${matchCount} adet Wikipedia (Wikimedia) bagimliligi yok edildi.`);
