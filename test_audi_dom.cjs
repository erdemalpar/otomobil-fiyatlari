const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto('https://fiyatlistesi.audi.com.tr/2026/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check for elements that might contain prices (e.g. text containing TL, ₺, etc)
    const elements = await page.evaluate(() => {
        const results = [];
        // find elements containing '₺' or 'TL'
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walker.nextNode()) {
            if(node.nodeValue.includes('₺') || node.nodeValue.includes('TL')) {
                // get parent element text
                let parentText = node.parentElement.parentElement.innerText;
                if (!results.includes(parentText)) {
                    results.push(parentText);
                }
            }
        }
        return results;
    });
    console.log('Price elements:', elements);

    // Get all class names to see structure
    const classes = await page.evaluate(() => {
        const cls = new Set();
        document.querySelectorAll('div').forEach(el => {
            if(el.className) {
                if (typeof el.className === 'string') {
                    el.className.split(' ').forEach(c => cls.add(c));
                }
            }
        });
        return Array.from(cls).filter(c => c.includes('model') || c.includes('car') || c.includes('price') || c.includes('row') || c.includes('item'));
    });
    console.log('Classes:', classes);

    // Let's click on the first "model" button to see if it reveals prices
    try {
        const buttons = await page.$$('button');
        if (buttons.length > 0) {
            await buttons[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newText = await page.evaluate(() => document.body.innerText);
            console.log('Text after click:', newText.substring(0, 1000));
        }
    } catch(e) {}
    
    // Let's just find any div containing the word "TFSI" or "TDI"
    const cars = await page.evaluate(() => {
        const res = [];
        document.querySelectorAll('div, span, p').forEach(el => {
            if(el.innerText && (el.innerText.includes('TFSI') || el.innerText.includes('TDI') || el.innerText.includes('e-tron'))) {
                res.push(el.innerText.replace(/\n/g, ' '));
            }
        });
        // filter out dupes
        return Array.from(new Set(res)).filter(x => x.length < 200 && (x.includes('₺') || x.includes('TL') || /\d{1,3}(\.\d{3})*/.test(x)));
    });
    console.log('Potential cars:', cars);

    await browser.close();
})();
