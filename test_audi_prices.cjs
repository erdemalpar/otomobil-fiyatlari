const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto('https://fiyatlistesi.audi.com.tr/2025/8Y', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const data = await page.evaluate(() => {
        const results = [];
        // The models and prices are often in list or table format. Let's look for "TL" or "₺"
        const elements = document.querySelectorAll('.price_list__bottom_info_price, .price_list__list_item_price, .price, div, span');
        elements.forEach(el => {
            if(el.innerText && (el.innerText.includes('₺') || el.innerText.includes('TL')) && el.innerText.length < 50) {
                // If it's a small element containing price, get its parent text
                let parentText = el.parentElement ? el.parentElement.innerText.replace(/\n/g, ' ') : el.innerText;
                if(!results.includes(parentText)) results.push(parentText);
            }
        });
        
        // Sometimes the select box has the models, and the price is shown dynamically. Let's get all options in custom dropdown
        const customDropdowns = document.querySelectorAll('.motor_option_item');
        const options = Array.from(customDropdowns).map(el => el.innerText);

        // Or standard text nodes with prices
        const priceNodes = Array.from(document.querySelectorAll('.price_list__list_item_price, .price-val')).map(el => el.innerText);
        
        return { 
            parentsWithPrices: results.slice(0, 5), 
            options: options.slice(0, 5),
            priceNodes: priceNodes
        };
    });
    console.log(JSON.stringify(data, null, 2));

    await browser.close();
})();
