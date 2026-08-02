const puppeteer = require('puppeteer');
const fs = require('fs');

const dataPath = 'public/data/vehicles.json';

(async () => {
    console.log("Scraping Audi prices...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // 1. Get model links from homepage
    await page.goto('https://fiyatlistesi.audi.com.tr/2025/', { waitUntil: 'networkidle0', timeout: 60000 });
    const modelsInfo = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href');
            if(href && href.startsWith('2025/')) {
                // Try to find image near this link
                let img = a.parentElement.querySelector('img[src*="cross"]');
                let imgSrc = img ? img.src : null;
                if(!links.some(l => l.href === href)) {
                    links.push({ href: href, img: imgSrc });
                }
            }
        });
        return links;
    });
    
    console.log(`Found ${modelsInfo.length} model pages.`);
    
    const scrapedCars = [];

    // 2. Visit each link
    for (const model of modelsInfo) {
        try {
            await page.goto(`https://fiyatlistesi.audi.com.tr/${model.href}`, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Allow JS to initialize
            await new Promise(r => setTimeout(r, 1000));
            
            // Get all options in the dropdowns (engine, equipment, etc.)
            const optionsData = await page.evaluate(async () => {
                const results = [];
                // Motor option is usually what changes the car version and price
                const motorOptions = Array.from(document.querySelectorAll('.motor_option_item'));
                
                if (motorOptions.length === 0) {
                    // Just read the current price if no options
                    const priceEl = Array.from(document.querySelectorAll('div, span')).find(el => el.innerText && el.innerText.includes('Tavsiye Edilen Anahtar Teslim Fiyatı') && el.innerText.includes('₺'));
                    if (priceEl) {
                        // find the car name, usually h1 or strong or some title class
                        const titleEl = document.querySelector('h1, h2, .model-title, .title') || priceEl.parentElement;
                        results.push({
                            name: titleEl ? titleEl.innerText.split('Tavsiye')[0].trim() : 'Audi',
                            priceStr: priceEl.innerText
                        });
                    }
                } else {
                    for (let opt of motorOptions) {
                        const carName = opt.innerText.trim();
                        opt.click();
                        // wait a bit for price to update
                        await new Promise(res => setTimeout(res, 500));
                        
                        // find price on screen
                        const priceEls = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.innerText && el.innerText.includes('Tavsiye Edilen Anahtar Teslim Fiyatı') && el.innerText.includes('₺') && el.innerText.length < 150);
                        if (priceEls.length > 0) {
                            results.push({
                                name: carName,
                                priceStr: priceEls[priceEls.length-1].innerText
                            });
                        }
                    }
                }
                return results;
            });
            
            for (let data of optionsData) {
                // Parse price
                const match = data.priceStr.match(/(\d{1,3}(?:\.\d{3})*)/);
                if (match && data.name) {
                    const price = parseInt(match[1].replace(/\./g, ''), 10);
                    scrapedCars.push({
                        name: data.name.replace(/\n/g, ' ').trim(),
                        price: price,
                        img: model.img
                    });
                    console.log(`Scraped: ${data.name} - ${price} TL`);
                }
            }
        } catch(e) {
            console.log(`Failed on ${model.href}: ${e.message}`);
        }
    }
    
    await browser.close();

    if (scrapedCars.length > 0) {
        const db = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        
        // Filter out old Audi cars
        db.vehicles = db.vehicles.filter(v => v.brand !== 'Audi');
        
        scrapedCars.forEach(item => {
            // Determine model name
            let modelName = "Audi";
            if (item.name.includes("A3 Sportback")) modelName = "A3 Sportback";
            else if (item.name.includes("A3 Sedan")) modelName = "A3 Sedan";
            else if (item.name.includes("A4")) modelName = "A4";
            else if (item.name.includes("A5")) modelName = "A5";
            else if (item.name.includes("A6")) modelName = "A6";
            else if (item.name.includes("A8")) modelName = "A8";
            else if (item.name.includes("Q2")) modelName = "Q2";
            else if (item.name.includes("Q3")) modelName = "Q3";
            else if (item.name.includes("Q4")) modelName = "Q4";
            else if (item.name.includes("Q5")) modelName = "Q5";
            else if (item.name.includes("Q7")) modelName = "Q7";
            else if (item.name.includes("Q8")) modelName = "Q8";
            else if (item.name.includes("e-tron GT")) modelName = "e-tron GT";
            
            let id = `audi-${modelName.toLowerCase().replace(/ /g, '-')}-${item.price}`;
            
            let fuel = "Benzin";
            if(item.name.includes('TDI')) fuel = "Dizel";
            if(item.name.includes('e-tron')) fuel = "Elektrik";
            
            db.vehicles.push({
                id: id,
                brand: "Audi",
                model: modelName,
                version: item.name.replace(modelName, '').trim(),
                type: fuel === 'Elektrik' ? 'Elektrikli' : 'İçten Yanmalı',
                price_list: item.price,
                price_campaign: item.price,
                image_url: item.img,
                features: ["Otomatik", fuel]
            });
        });

        db.lastUpdated = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
        console.log(`Audi data successfully updated with ${scrapedCars.length} cars!`);
    } else {
        console.log("No cars were scraped.");
    }
})();
