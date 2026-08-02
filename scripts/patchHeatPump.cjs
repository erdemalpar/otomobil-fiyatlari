const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'vehicles.json');

function patchHeatPumps() {
    let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let updated = 0;
    
    // Bazi populer araclarda isi pompasinin olup olmadigini AI bilgisiyle zenginlestirelim
    const knownHeatPumps = {
        'Tesla': { 'Model Y': 'Standart (Var)' },
        'Togg': { 'T10X': 'Opsiyonel (Kış Paketi)' },
        'Hyundai': { 
            'IONIQ 5': 'Standart (Var)', 
            'IONIQ 6': 'Standart (Var)',
            'KONA': 'Donanıma Bağlı (Var)'
        },
        'Renault': { 'Megane E-Tech': 'Opsiyonel' },
        'Volvo': { 'EX30': 'Standart (Var)', 'XC40': 'Standart (Var)', 'EX40': 'Standart (Var)' },
        'BYD': { 'Atto 3': 'Standart (Var)', 'Seal': 'Standart (Var)' },
        'Peugeot': { 'E-2008': 'Standart (Var)' },
        'Kia': { 'EV6': 'Standart (Var)' }
    };

    db.vehicles.forEach(v => {
        // Zaten bir heat_pump bilgisi varsa es gec (veya uzerine yaz)
        if (knownHeatPumps[v.brand] && knownHeatPumps[v.brand][v.model]) {
            if (!v.specs) v.specs = {};
            v.specs.heat_pump = knownHeatPumps[v.brand][v.model];
            updated++;
        }
    });

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Tamamlandı. ${updated} elektrikli araç ısı pompası verisiyle zenginleştirildi.`);
}

patchHeatPumps();
