const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Log API responses for JSON data
    page.on('response', async (response) => {
        if (response.url().includes('api') || response.url().includes('json')) {
            console.log('API URL:', response.url());
            try {
                const text = await response.text();
                if (text.includes('Tonale') || text.includes('Giulia')) {
                    console.log('Found cars in API:', text.substring(0, 500));
                }
            } catch(e) {}
        }
    });

    await page.goto('https://arjfiyat.tofas.com.tr/pricelists?brand=alfa-romeo', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const html = await page.evaluate(() => document.body.innerHTML);
    
    // Check for tables or price classes
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Iframe Text Content:', text.substring(0, 1500));

    await browser.close();
})();
