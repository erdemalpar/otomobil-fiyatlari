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
                if (text.includes('A3') || text.includes('Q3')) {
                    console.log('Found cars in API:', text.substring(0, 300));
                }
            } catch(e) {}
        }
    });

    await page.goto('https://fiyatlistesi.audi.com.tr/2026/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const html = await page.evaluate(() => document.body.innerHTML);
    
    // Get text content of body
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Text Content:', text.substring(0, 1000));
    
    // Also check for links or tables
    const tables = await page.$$('table');
    console.log(`Found ${tables.length} tables.`);
    
    const data = await page.evaluate(() => {
        const models = [];
        document.querySelectorAll('tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                models.push(tr.innerText.replace(/\n/g, ' '));
            }
        });
        return models.slice(0, 10);
    });
    console.log('Sample rows:', data);

    await browser.close();
})();
