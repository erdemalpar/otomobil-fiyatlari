const puppeteer = require('puppeteer');
const fs = require('fs');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

(async () => {
    console.log("Starting image scraper for missing vehicles...");
    
    // Find missing unique models
    const missingModels = new Set();
    db.vehicles.forEach(v => {
        if (!v.image_url || v.image_url.includes('placeholder') || v.image_url === '') {
            missingModels.add(`${v.brand} ${v.model}`);
        }
    });
    
    const uniqueModels = Array.from(missingModels);
    console.log(`Need to fetch images for ${uniqueModels.length} models.`);
    
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Dictionary to store found image URLs
    const imageCache = {};

    for (let i = 0; i < uniqueModels.length; i++) {
        const query = uniqueModels[i];
        console.log(`[${i+1}/${uniqueModels.length}] Searching for: ${query}`);
        
        try {
            // Using Bing Images as it is easier to scrape than Google and has good quality
            const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' car png isolated')}&qft=+filterui:photo-transparent`;
            
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Extract the first good image
            const imgUrl = await page.evaluate(() => {
                // Bing uses 'm' attribute which is a JSON containing 'murl' (media url)
                const items = document.querySelectorAll('a.iusc');
                for (let item of items) {
                    const mAttr = item.getAttribute('m');
                    if (mAttr) {
                        try {
                            const mData = JSON.parse(mAttr);
                            if (mData.murl && (mData.murl.toLowerCase().endsWith('.png') || mData.murl.includes('png'))) {
                                return mData.murl;
                            }
                            return mData.murl; // Fallback to first if no png suffix found but still filtered
                        } catch(e) {}
                    }
                }
                
                // Fallback for simple img tags
                const img = document.querySelector('img.mimg');
                return img ? img.src : null;
            });

            if (imgUrl) {
                console.log(`Found: ${imgUrl}`);
                imageCache[query] = imgUrl;
            } else {
                console.log(`No image found for ${query}`);
                imageCache[query] = `https://ui-avatars.com/api/?name=${encodeURIComponent(query)}&background=random&color=fff&size=512`;
            }
        } catch(error) {
            console.log(`Error fetching ${query}: ${error.message}`);
        }
        
        // Wait a bit to avoid getting blocked
        await new Promise(r => setTimeout(r, 1000));
    }
    
    await browser.close();

    // Update the database
    let updatedCount = 0;
    db.vehicles.forEach(v => {
        if (!v.image_url || v.image_url.includes('placeholder') || v.image_url === '') {
            const query = `${v.brand} ${v.model}`;
            if (imageCache[query]) {
                v.image_url = imageCache[query];
                updatedCount++;
            }
        }
    });

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
    
    console.log(`Successfully updated ${updatedCount} vehicle records with images!`);
})();
