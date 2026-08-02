const fs = require('fs');
const https = require('https');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const fetchJson = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'AutoPriceTracker/1.0 (Contact: user@domain.com)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    resolve({});
                }
            });
        }).on('error', reject);
    });
};

const getWikipediaImage = async (query) => {
    // Search Wikimedia Commons
    let url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
    
    let data = await fetchJson(url);
    if (!data.query || !data.query.pages) return null;
    
    for (let pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
            const imgUrl = page.imageinfo[0].url;
            if (imgUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
                return imgUrl;
            }
        }
    }
    return null;
};

(async () => {
    console.log("Starting Commons image scraper with year context...");
    
    let updatedCount = 0;
    
    for (let i = 0; i < db.vehicles.length; i++) {
        let v = db.vehicles[i];
        if (!v.image_url || v.image_url.includes('placeholder') || v.image_url === '') {
            const currentYear = new Date().getFullYear(); // 2026
            
            // Try with 2026
            let query = `${v.brand} ${v.model} ${currentYear}`;
            console.log(`[${i+1}/${db.vehicles.length}] Searching: ${query}`);
            let imgUrl = await getWikipediaImage(query);
            
            // Fallback to 2025
            if (!imgUrl) {
                query = `${v.brand} ${v.model} ${currentYear - 1}`;
                imgUrl = await getWikipediaImage(query);
            }
            
            // Fallback to model only
            if (!imgUrl) {
                query = `${v.brand} ${v.model}`;
                imgUrl = await getWikipediaImage(query);
            }
            
            if (imgUrl) {
                console.log(`Found: ${imgUrl}`);
                v.image_url = imgUrl;
                updatedCount++;
            } else {
                console.log(`Not found for: ${v.brand} ${v.model}`);
            }
            
            await new Promise(r => setTimeout(r, 200)); // be nice to API
        }
    }

    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
    
    console.log(`Successfully updated ${updatedCount} vehicle records with images!`);
})();
