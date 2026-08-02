const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Ağ isteklerini yakala
    await page.setRequestInterception(true);
    const jsonUrls = [];
    
    page.on('request', request => {
        request.continue();
    });

    page.on('response', async response => {
        const url = response.url();
        const type = response.headers()['content-type'] || '';
        if (type.includes('application/json') || url.endsWith('.json')) {
            jsonUrls.push(url);
            try {
                if (url.includes('data') || url.includes('api') || url.includes('fiyat') || url.includes('car')) {
                    const json = await response.json();
                    console.log(`URL: ${url}`);
                    console.log(`Snippet: ${JSON.stringify(json).substring(0, 300)}`);
                    console.log('---');
                }
            } catch(e) {}
        }
    });

    console.log("Navigating to otofiyatlist.com...");
    await page.goto('https://otofiyatlist.com/', { waitUntil: 'networkidle0' });
    
    console.log("\nFound JSON endpoints:");
    jsonUrls.forEach(u => console.log(u));
    
    await browser.close();
})();
