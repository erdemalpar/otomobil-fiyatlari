const puppeteer = require('puppeteer');
const fs = require('fs');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

(async () => {
    console.log("Starting Hyundai Inallar API scraper...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://hyundai.inallar.com.tr/fiyat-listesi', { waitUntil: 'networkidle2' });

    const modelsInfo = await page.evaluate(() => {
        const results = [];
        
        // 1. Get images from the navigation menu (these are transparent PNGs usually)
        const imageMap = {};
        document.querySelectorAll('ul.uk-nav a').forEach(a => {
            const h4 = a.querySelector('h4, span');
            const img = a.querySelector('img');
            if (h4 && img) {
                let name = h4.innerText.trim().toUpperCase();
                imageMap[name] = img.src;
            }
        });
        
        // Also look at main page blocks for images just in case
        document.querySelectorAll('.uk-card').forEach(card => {
            const title = card.querySelector('.uk-card-title, h1, h2, h3, h4');
            const img = card.querySelector('img');
            if (title && img) {
                imageMap[title.innerText.trim().toUpperCase()] = img.src;
            }
        });

        // 2. Find price tables
        // Inallar groups tables usually with a header above them.
        const containers = document.querySelectorAll('.uk-container > div, .price-list-wrapper, .uk-margin'); // We will just iterate all tables
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            // Find the closest preceding header (h1-h6) to get model name
            let elem = table.previousElementSibling;
            let modelName = "Hyundai Araç";
            let limit = 10;
            while (elem && limit > 0) {
                if (elem.tagName.match(/^H[1-6]$/)) {
                    modelName = elem.innerText.trim();
                    break;
                }
                const hInElem = elem.querySelector('h1, h2, h3, h4, h5');
                if (hInElem) {
                    modelName = hInElem.innerText.trim();
                    break;
                }
                elem = elem.previousElementSibling;
                limit--;
            }
            // Sometimes it's inside a wrapper
            if (modelName === "Hyundai Araç") {
               let parent = table.parentElement;
               while(parent && parent.tagName !== 'BODY') {
                   const h = parent.querySelector('h2, h3');
                   if(h && h.innerText.length > 0 && h.innerText.length < 30) {
                       modelName = h.innerText.trim();
                       break;
                   }
                   parent = parent.parentElement;
               }
            }

            const rows = table.querySelectorAll('tr');
            if (rows.length < 2) return; // not a price table

            const headCells = Array.from(rows[0].querySelectorAll('th, td')).map(td => td.innerText.trim().toUpperCase());
            
            // Find indexes for Motor, Donanım, Yakıt, Vites
            let motorIdx = -1, donanimIdx = -1, yakitIdx = -1, vitesIdx = -1;
            let priceColumns = []; // { index, year, type: 'liste' | 'kampanya' }
            
            headCells.forEach((text, idx) => {
                if (text.includes('MOTOR')) motorIdx = idx;
                else if (text.includes('DONANIM')) donanimIdx = idx;
                else if (text.includes('YAKIT')) yakitIdx = idx;
                else if (text.includes('VİTES')) vitesIdx = idx;
                else if (text.includes('TL') || text.includes('MODEL YILI')) {
                    // It's a price column
                    let year = "2024";
                    if (text.includes('2026')) year = "2026";
                    else if (text.includes('2025')) year = "2025";
                    
                    let type = text.includes('KAMPANYALI') ? 'kampanya' : 'liste';
                    priceColumns.push({ index: idx, year, type });
                }
            });
            
            // If we couldn't detect columns properly, skip or try manual
            if (priceColumns.length === 0) return;

            // Iterate rows
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length < priceColumns[0].index) continue; // skip sub-headers

                const getText = (idx) => (idx >= 0 && cells[idx]) ? cells[idx].innerText.trim() : "";
                
                const motor = getText(motorIdx);
                const donanim = getText(donanimIdx);
                const yakit = getText(yakitIdx) || "Benzin";
                const vites = getText(vitesIdx) || "Manuel";
                
                if (motor === "" && donanim === "") continue;

                // For each price column, check if there is a valid price
                const pricesByYear = {}; // year -> { liste, kampanya }
                
                priceColumns.forEach(pc => {
                    let pText = getText(pc.index).replace(/[^0-9]/g, '');
                    if (pText.length > 4) { // valid price
                        let p = parseInt(pText, 10);
                        if (!pricesByYear[pc.year]) pricesByYear[pc.year] = {};
                        pricesByYear[pc.year][pc.type] = p;
                    }
                });

                // Add to results
                for (const year of Object.keys(pricesByYear)) {
                    let liste = pricesByYear[year].liste || null;
                    let kampanya = pricesByYear[year].kampanya || liste;
                    
                    if (liste || kampanya) {
                        // find best image
                        let img = null;
                        for (const key of Object.keys(imageMap)) {
                            if (key.includes(modelName.toUpperCase()) || modelName.toUpperCase().includes(key)) {
                                img = imageMap[key];
                                break;
                            }
                        }

                        results.push({
                            brand: "Hyundai",
                            model: modelName,
                            version: `${year} ${motor} ${donanim}`.trim(),
                            fuel: yakit,
                            gear: vites,
                            year: year,
                            price_list: liste || kampanya,
                            price_campaign: kampanya,
                            image: img
                        });
                    }
                }
            }
        });
        
        return results;
    });

    console.log(`Scraped ${modelsInfo.length} Hyundai variants.`);

    if (modelsInfo.length > 0) {
        // Remove old Hyundai data
        const oldLength = db.vehicles.length;
        db.vehicles = db.vehicles.filter(v => v.brand !== 'Hyundai');
        const removed = oldLength - db.vehicles.length;

        // Add new
        const uniqueIds = new Set();
        let addedCount = 0;

        modelsInfo.forEach(item => {
            let type = "İçten Yanmalı";
            if (item.fuel.toLowerCase().includes('elektrik') || item.fuel.toLowerCase().includes('ev')) type = "Elektrikli";
            
            // Generate id
            const id = `hyundai-${item.model.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.version.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.price_campaign}`;
            
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                db.vehicles.push({
                    id: id,
                    brand: "Hyundai",
                    model: item.model.replace("Yeni ", "").trim(),
                    version: item.version,
                    type: type,
                    price_list: item.price_list,
                    price_campaign: item.price_campaign,
                    image_url: item.image,
                    features: [item.gear, item.fuel, item.year]
                });
                addedCount++;
            }
        });

        db.lastUpdated = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
        
        console.log(`Removed ${removed} old Hyundai cars.`);
        console.log(`Added ${addedCount} new dynamic Hyundai cars across all years.`);
    } else {
        console.log("No cars were scraped. Verify HTML structure.");
    }
    
    await browser.close();
})();
