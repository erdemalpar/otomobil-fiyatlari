const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

const generateId = (model, version) => {
    const safeModel = (model || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeVersion = (version || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `renault-${safeModel}-${safeVersion}`.replace(/-+$/g, '');
};

const getRenaultImage = (modelName) => {
    const name = modelName.toLowerCase();
    if (name.includes("clio")) return "https://cdn.group.renault.com/ren/tr/models/clio/clio-ph2/bja-ph2-home/renault-clio-bja-ph2-home-360-1.png.ximg.xsmall.png/1706249767664.png";
    if (name.includes("megane")) return "https://cdn.group.renault.com/ren/tr/models/megane-sedan/megane-sedan-ph2/home/renault-megane-sedan-ph2-home-360-1.png.ximg.xsmall.png/1706249852233.png";
    if (name.includes("austral")) return "https://cdn.group.renault.com/ren/tr/models/austral/austral-hcb/home/renault-austral-hcb-home-360-1.png.ximg.xsmall.png/1706249876274.png";
    if (name.includes("capture") || name.includes("captur")) return "https://cdn.group.renault.com/ren/tr/models/captur/captur-ph2/hjb-ph2-home/renault-captur-hjb-ph2-home-360-1.png.ximg.xsmall.png/1715840616900.png";
    if (name.includes("duster")) return "https://cdn.group.renault.com/ren/tr/models/duster/p1310-home/renault-duster-p1310-home-360-1.png.ximg.xsmall.png/1715840590453.png";
    if (name.includes("taliant")) return "https://cdn.group.renault.com/ren/tr/models/taliant/taliant-ljf/home/renault-taliant-ljf-home-360-1.png.ximg.xsmall.png/1706249791494.png";
    
    return "https://cdn.group.renault.com/ren/tr/assets/renault-logo.png";
};

async function scrapeRenault() {
    console.log("Renault API kazıyıcı çalışıyor...");

    let res;
    try {
        res = await fetch('https://best.renault.com.tr/wp-json/service/v1/CatFiyatData?cat=Binek');
    } catch (e) {
        console.error("API'ye ulaşılamadı", e);
        return;
    }
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
        console.log("Veri bulunamadı.");
        return;
    }

    let db;
    try {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error("DB hatası", e);
        return;
    }

    // Eski Renault'ları sil
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Renault');

    const newRenaults = [];
    const usedIds = new Set();

    data.results.forEach(car => {
        const price = parseInt(car.AntesFiyati);
        if (!price || price === 0) return;

        const isElectric = car.YakitTipi.toLowerCase().includes("elektrik") || car.YakitTipi.toLowerCase().includes("e-tech");
        
        let hp = "Bilinmiyor";
        if (car.VersiyonAdi.toLowerCase().includes("hp")) {
            const match = car.VersiyonAdi.match(/([0-9]+)\s*hp/i);
            if (match) hp = match[1];
        }

        const id = generateId(car.ModelAdi, car.VersiyonAdi);
        if (usedIds.has(id)) return;
        usedIds.add(id);

        const engineText = car.VersiyonAdi.split(' ')[0] || "Motor";

        newRenaults.push({
            id: id,
            brand: "Renault",
            model: car.ModelAdi.replace("Yeni ", ""),
            version: car.VersiyonAdi,
            type: isElectric ? "Otomobil (Elektrik)" : "Otomobil",
            image_url: getRenaultImage(car.ModelAdi),
            features: [car.YakitTipi, car.VitesTipi, `${hp} bg`],
            specs: { 
                fuel_type: car.YakitTipi, 
                engine: isElectric ? "Bilinmiyor (EV)" : engineText, 
                horsepower: hp, 
                transmission: car.VitesTipi, 
                range: isElectric ? "450 km" : null, 
                charge_time: isElectric ? "30 Dk" : null, 
                torque: "Bilinmiyor" 
            },
            package_features: [],
            prices_by_year: { 
                "2025": Math.round((price * 0.9) / 1000) * 1000, 
                "2026": price, 
                "2027": Math.round((price * 1.15) / 1000) * 1000 
            },
            price_list: price,
            price_campaign: price
        });
    });

    db.vehicles = [...db.vehicles, ...newRenaults];
    db.lastUpdated = new Date().toISOString();

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Tamamlandı! ${newRenaults.length} adet Renault aracı başarıyla entegre edildi.`);
}

scrapeRenault();
