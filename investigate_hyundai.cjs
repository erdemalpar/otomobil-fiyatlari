const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://hyundai.inallar.com.tr/fiyat-listesi', { waitUntil: 'networkidle2' });

    const modelsInfo = await page.evaluate(() => {
        const results = [];
        // Tabloları veya araç bloklarını bul
        const carBlocks = document.querySelectorAll('.uk-card, table, .price-table, .model-item, .price-list-item');
        
        // Örnek olarak ekrandaki tüm h2/h3 başlıklarını ve tablo satırlarını çekelim
        const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5')).map(h => h.innerText.trim()).filter(h => h.length > 0);
        
        const tables = Array.from(document.querySelectorAll('table')).map(table => {
            const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
                return Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim());
            });
            return rows;
        });
        
        // Resimleri de alalım
        const images = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(src => src.includes('model') || src.includes('car'));
        
        return {
            headers: headers.slice(0, 10), // İlk 10 başlık
            tables: tables.slice(0, 2),    // İlk 2 tablo (örnek)
            images: images.slice(0, 5)     // İlk 5 resim
        };
    });

    console.log(JSON.stringify(modelsInfo, null, 2));
    await browser.close();
})();
