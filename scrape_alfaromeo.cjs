const puppeteer = require('puppeteer');
const fs = require('fs');

const dataPath = 'public/data/vehicles.json';

(async () => {
    console.log("Scraping Alfa Romeo...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto('https://arjfiyat.tofas.com.tr/pricelists?brand=alfa-romeo', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const data = await page.evaluate(() => {
        const models = Array.from(document.querySelectorAll('tr')).map(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 5) {
                return {
                    model: tds[0].innerText.trim(),
                    gear: tds[3].innerText.trim(),
                    fuel: tds[4].innerText.trim(),
                    priceStr: tds[5] ? tds[5].innerText.trim() : null
                };
            }
            return null;
        }).filter(x => x && x.priceStr && x.priceStr.includes('TL'));
        
        const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
        
        return { models, images };
    });
    
    await browser.close();

    const db = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Remove existing Alfa Romeo to replace with actual live list
    db.vehicles = db.vehicles.filter(v => v.brand !== 'Alfa Romeo');

    data.models.forEach(item => {
        const price = parseInt(item.priceStr.replace(/[^0-9]/g, ''), 10);
        let id = `alfa-romeo-${item.model.toLowerCase().replace(/ /g, '-')}`;
        
        let img = null;
        if (item.model.includes('JUNIOR ELETTRICA')) img = data.images.find(i => i.includes('junior-electtrica'));
        else if (item.model.includes('JUNIOR IBRIDA')) img = data.images.find(i => i.includes('junior-ibrida'));
        else if (item.model.includes('TONALE')) img = data.images.find(i => i.includes('tonale'));
        
        db.vehicles.push({
            id: id,
            brand: "Alfa Romeo",
            model: item.model.split(' ')[0], // TONALE or JUNIOR
            version: item.model,
            type: item.fuel.includes('Elektrik') ? 'Elektrikli' : (item.fuel.includes('Hibrit') ? 'Hibrit' : 'İçten Yanmalı'),
            price_list: price,
            price_campaign: price,
            image_url: img,
            features: [item.gear, item.fuel]
        });
        console.log(`Added: ${item.model} - ${price} TL`);
    });

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
    console.log("Alfa Romeo data successfully updated in vehicles.json!");
})();
