const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Log API responses
    page.on('response', async (response) => {
        if (response.url().includes('json') || response.url().includes('api')) {
            console.log('API URL:', response.url());
            try {
                const text = await response.text();
                if (text.includes('TFSI')) {
                    console.log('Found cars in API:', text.substring(0, 500));
                }
            } catch(e) {}
        }
    });

    await page.goto('https://fiyatlistesi.audi.com.tr/2025/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check if there is a json object embedded in the script tag
    const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script')).map(s => s.innerText).filter(t => t.includes('A3') || t.includes('TFSI'));
    });
    console.log(`Found ${scripts.length} matching scripts.`);
    if (scripts.length > 0) {
        console.log('Script excerpt:', scripts[0].substring(0, 1000));
    }

    // Attempt to click all the "Model" toggles to reveal contents
    await page.evaluate(() => {
        const divs = document.querySelectorAll('div');
        divs.forEach(div => {
            if (div.innerText && div.innerText.includes('Model') && div.children.length === 0) {
                div.click();
            }
        });
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract text again
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Text after clicking models:', text.substring(0, 1500));
    
    await browser.close();
})();
