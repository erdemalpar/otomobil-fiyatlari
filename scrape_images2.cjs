const puppeteer = require('puppeteer');
const fs = require('fs');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

(async () => {
    console.log("Starting smart image scraper for missing vehicles...");
    
    const missingModels = new Set();
    db.vehicles.forEach(v => {
        if (!v.image_url || v.image_url.includes('placeholder') || v.image_url === '') {
            missingModels.add(`${v.brand}::${v.model}`);
        }
    });
    
    const uniqueModels = Array.from(missingModels).map(x => {
        const [b, m] = x.split('::');
        return { brand: b, model: m, query: `${b} ${m}` };
    });
    
    console.log(`Need to fetch images for ${uniqueModels.length} models.`);
    
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    const imageCache = {};

    for (let i = 0; i < uniqueModels.length; i++) {
        const { brand, model, query } = uniqueModels[i];
        
        // Add current year to the query as requested by the user
        const currentYear = new Date().getFullYear();
        const searchQuery = `${query} ${currentYear} car transparent png`;
        
        console.log(`[${i+1}/${uniqueModels.length}] Searching for: ${searchQuery}`);
        
        try {
            const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&qft=+filterui:photo-transparent`;
            
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            
            const brandKeyword = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
            const modelKeyword = model.toLowerCase().replace(/[^a-z0-9]/g, '');
            // We expect the brand or model to be part of the image URL or the page it comes from.
            
            const imgUrl = await page.evaluate((brandKw, modelKw) => {
                const items = document.querySelectorAll('a.iusc');
                for (let item of items) {
                    const mAttr = item.getAttribute('m');
                    if (mAttr) {
                        try {
                            const mData = JSON.parse(mAttr);
                            let url = mData.murl ? mData.murl.toLowerCase() : '';
                            let title = mData.t ? mData.t.toLowerCase() : '';
                            
                            // Check if the URL or Title contains the brand or model to avoid llamas or maps
                            if (url.includes(brandKw) || url.includes(modelKw) || title.includes(brandKw) || title.includes(modelKw) || url.includes('car') || url.includes('auto')) {
                                if (url.endsWith('.png') || url.includes('png')) {
                                    return mData.murl;
                                }
                            }
                        } catch(e) {}
                    }
                }
                
                // If no strict match, fallback to any matching brand/model loosely
                for (let item of items) {
                    const mAttr = item.getAttribute('m');
                    if (mAttr) {
                        try {
                            const mData = JSON.parse(mAttr);
                            let url = mData.murl ? mData.murl.toLowerCase() : '';
                            if (url.includes(brandKw) || url.includes(modelKw)) {
                                return mData.murl;
                            }
                        } catch(e) {}
                    }
                }

                return null;
            }, brandKeyword, modelKeyword);

            if (imgUrl) {
                console.log(`Found: ${imgUrl}`);
                imageCache[query] = imgUrl;
            } else {
                console.log(`No safe image found for ${query}`);
                // fallback to wikipedia
                imageCache[query] = `https://ui-avatars.com/api/?name=${encodeURIComponent(query)}&background=random&color=fff&size=512`;
            }
        } catch(error) {
            console.log(`Error fetching ${query}: ${error.message}`);
        }
        
        await new Promise(r => setTimeout(r, 500));
    }
    
    await browser.close();

    let updatedCount = 0;
    db.vehicles.forEach(v => {
        if (!v.image_url || v.image_url.includes('placeholder') || v.image_url === '') {
            const query = `${v.brand} ${v.model}`;
            if (imageCache[query] && !imageCache[query].includes('ui-avatars')) {
                v.image_url = imageCache[query];
                updatedCount++;
            }
        }
    });

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
    
    console.log(`Successfully updated ${updatedCount} vehicle records with 2026/2025 models!`);
})();
