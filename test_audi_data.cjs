const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto('https://fiyatlistesi.audi.com.tr/2025/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const nextData = await page.evaluate(() => {
        if (window.__NEXT_DATA__) return window.__NEXT_DATA__;
        if (window.__NUXT__) return window.__NUXT__;
        
        // Return any global variables that look like big data objects
        const globals = Object.keys(window);
        return globals.filter(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('state'));
    });
    
    console.log('Global data objects:', typeof nextData === 'object' ? JSON.stringify(nextData).substring(0, 1000) : nextData);

    // Get all html to see if there is any hidden json
    const html = await page.evaluate(() => document.body.innerHTML);
    const hasJson = html.includes('{') && html.includes('TFSI');
    console.log('Has JSON in HTML containing TFSI:', hasJson);
    
    await browser.close();
})();
