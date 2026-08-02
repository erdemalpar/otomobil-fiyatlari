const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Ağ isteklerini yakala
    await page.setRequestInterception(true);
    
    page.on('request', request => {
        if (request.url().includes('api.otofiyatlist.com') || request.url().endsWith('.json')) {
            console.log("Req URL:", request.url());
        }
        request.continue();
    });

    console.log("Navigating to otofiyatlist.com...");
    await page.goto('https://otofiyatlist.com/#/fiyat-listesi?d=2026-08-01', { waitUntil: 'networkidle0' });
    
    // Wait a bit more to ensure table data loads
    await new Promise(r => setTimeout(r, 3000));
    
    await browser.close();
})();
