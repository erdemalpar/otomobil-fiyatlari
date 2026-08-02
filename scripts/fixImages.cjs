const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

// Güvenilir, yüksek çözünürlüklü ve patlamayan açık kaynaklı (Wikimedia Commons) resim bağlantıları
const imageMappings = {
    // Renault Eksikleri
    "Rafale": "",
    "Scenic E-Tech": "",
    "R5 E-Tech": "",
    "Boreal": "", // Boreal model veya donanımı yerine en yakın
    
    // Fiat (Bozuk Linkleri Düzeltme)
    "Egea Sedan": "",
    "Egea Cross": "",
    "500e": "",
    
    // Mercedes Eksik / AMG
    "C 63 S": "",
    
    // Alfa Romeo Tonale (Bozuk/Kırık Link Düzeltme)
    "Tonale": "",
    
    // Audi A3 (Eksik veya Bozuk Düzeltme)
    "A3": "",
    
    // Skoda
    "Scala": "",
    "Octavia": "",
    "Kodiaq": ""
};

async function fixImages() {
    console.log("Hatali ve eksik arac gorselleri Wikipedia kaynaklariyla onariliyor...");
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let updatedCount = 0;

    db.vehicles = db.vehicles.map(vehicle => {
        let matched = false;
        
        // Model veya Versiyon adina gore haritalama kontrolu
        for (const [key, url] of Object.entries(imageMappings)) {
            if (vehicle.model.includes(key) || vehicle.version.includes(key)) {
                // Sadece eger su anki resim logo.svg, bos, veya eski kirik bayi linkiyse guncelle
                if (!vehicle.image_url || 
                    vehicle.image_url.includes('logo') || 
                    vehicle.image_url.includes('placeholder') || 
                    vehicle.image_url.includes('dam/fiat') || 
                    vehicle.image_url.includes('dam/alfa') ||
                    vehicle.image_url.includes('nemo/models') ||
                    vehicle.brand === 'Renault' && vehicle.image_url.includes('logo.png')
                ) {
                    vehicle.image_url = url;
                    matched = true;
                }
            }
        }
        
        if (matched) updatedCount++;
        return vehicle;
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`${updatedCount} adet aracin gorseli guvenli internet kaynaklariyla basariyla degistirildi!`);
}

fixImages();
