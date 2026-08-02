const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Log API responses
    page.on('response', async (response) => {
        if (response.url().includes('json') || response.url().includes('api')) {
            console.log('API URL:', response.url());
        }
    });

    await page.goto('https://www.alfaromeo.com.tr/alfa-romeo-fiyat-listesi', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const html = await page.evaluate(() => document.body.innerHTML);
    
    // Check if there are any iframes
    const iframes = await page.$$('iframe');
    console.log(`Found ${iframes.length} iframes.`);
    for (let frame of iframes) {
        console.log('Iframe src:', await page.evaluate(el => el.src, frame));
    }
    
    // Check for pdf links
    const pdfLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href$=".pdf"]')).map(a => a.href);
    });
    console.log('PDF links:', pdfLinks);

    await browser.close();
})();
