const fs = require('fs');
const https = require('https');
const http = require('http');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const checkImage = (url) => {
    return new Promise((resolve) => {
        if (!url || url.includes('ui-avatars')) {
            return resolve(false); // Consider avatars or empty as not real images
        }
        
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // to bypass basic hotlink protections
            },
            timeout: 5000 // 5 seconds timeout
        }, (res) => {
            const isImage = res.headers['content-type'] && res.headers['content-type'].startsWith('image/');
            if (res.statusCode >= 200 && res.statusCode < 400 && isImage) {
                resolve(true);
            } else {
                resolve(false);
            }
            res.resume(); // consume response data to free up memory
        }).on('error', () => {
            resolve(false);
        }).on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
};

(async () => {
    console.log("Checking for broken images...");
    let brokenCount = 0;
    
    // Check all unique URLs to save time
    const uniqueUrls = new Set();
    db.vehicles.forEach(v => {
        if(v.image_url) uniqueUrls.add(v.image_url);
    });
    
    const urlStatus = {};
    let checked = 0;
    const urlArray = Array.from(uniqueUrls);
    
    console.log(`Checking ${urlArray.length} unique URLs...`);
    
    // Batch processing to not hit limits
    for (let i = 0; i < urlArray.length; i++) {
        const url = urlArray[i];
        process.stdout.write(`\rChecking ${i+1}/${urlArray.length}...`);
        const isValid = await checkImage(url);
        urlStatus[url] = isValid;
    }
    
    console.log('\nFinished checking URLs.');
    
    // Now apply fixes
    db.vehicles.forEach(v => {
        if (v.image_url && urlStatus[v.image_url] === false) {
            console.log(`Broken Image removed for: ${v.brand} ${v.model} (${v.image_url.substring(0,50)}...)`);
            v.image_url = null; // We reset it to null so UI falls back or we try again
            brokenCount++;
        }
    });

    if (brokenCount > 0) {
        db.lastUpdated = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
        console.log(`Removed ${brokenCount} broken image links.`);
    } else {
        console.log("No broken images found.");
    }
})();
