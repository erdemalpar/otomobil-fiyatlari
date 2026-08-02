const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto('https://arjfiyat.tofas.com.tr/pricelists?brand=alfa-romeo', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const data = await page.evaluate(() => {
        const results = [];
        // The structure seems to have repeating blocks for cars. 
        // Let's get all images and text blocks.
        const blocks = document.querySelectorAll('.accordion-item, .card, .table-responsive, table, .pricelist-item'); // guess classes
        
        const models = Array.from(document.querySelectorAll('tr')).map(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 5) {
                return {
                    model: tds[0].innerText.trim(),
                    gear: tds[3].innerText.trim(),
                    fuel: tds[4].innerText.trim(),
                    price: tds[5] ? tds[5].innerText.trim() : null
                };
            }
            return null;
        }).filter(x => x && x.price && x.price.includes('TL'));
        
        const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
        
        return { models, images };
    });
    
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
})();
