const fs = require('fs');
const https = require('https');

const dataPath = 'public/data/vehicles.json';
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Modeli temizlemek için (örn: "BMW 120" -> "BMW 120 car transparent")
function getSearchQuery(brand, model) {
    return encodeURIComponent(`${brand} ${model} car png transparent`);
}

// Basit Promise-based HTTP GET 
function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }, (res) => {
            let data = '';
            // Yönlendirme (Redirect) varsa takip et (DuckDuckGo Lite yönlendirebiliyor)
            if (res.statusCode === 301 || res.statusCode === 302) {
                return fetchHTML(res.headers.location).then(resolve).catch(reject);
            }
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(''); // Hata olmasın diye boş dön
        });
    });
}

async function searchImage(brand, model) {
    const q = getSearchQuery(brand, model);
    // DuckDuckGo Lite sürümünden resim aramak bazen zordur.
    // Wikimedia Commons API deneyelim. Bu arabalar için çok daha kararlı ve API tabanlıdır.
    // Sorguyu temizle: BMW 120
    const cleanSearch = encodeURIComponent(`${brand} ${model}`);
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${cleanSearch}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
    
    try {
        const jsonStr = await fetchHTML(wikiUrl);
        const json = JSON.parse(jsonStr);
        if (json.query && json.query.pages) {
            const pages = Object.values(json.query.pages);
            for (let page of pages) {
                if (page.imageinfo && page.imageinfo.length > 0) {
                    const url = page.imageinfo[0].url;
                    // PNG veya JPG ise al (tercihen araç resmidir)
                    if (url.toLowerCase().endsWith('.png') || url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.webp')) {
                        return url;
                    }
                }
            }
        }
    } catch(e) {}
    
    // Wiki bulamadıysa dummy bir url dönebiliriz veya null.
    return null;
}

(async () => {
    console.log("Image Fetcher Başlatıldı...");
    
    // Benzersiz modelleri topla
    const uniqueModels = new Map(); // "Brand Model" -> {brand, model, url: null}
    db.vehicles.forEach(v => {
        const key = `${v.brand} ${v.model}`;
        if (!uniqueModels.has(key)) {
            uniqueModels.set(key, { brand: v.brand, model: v.model, url: v.image_url });
        }
    });

    console.log(`Toplam ${uniqueModels.size} benzersiz model bulundu.`);
    
    const modelsToFetch = Array.from(uniqueModels.values()).filter(m => !m.url);
    console.log(`${modelsToFetch.length} adet resimsiz modele resim aranacak.`);

    let count = 0;
    // Paralel limitli çekim (Wikipedia rate-limit'e takılmamak için 5'erli gruplar)
    for (let i = 0; i < modelsToFetch.length; i += 5) {
        const chunk = modelsToFetch.slice(i, i + 5);
        const promises = chunk.map(async (m) => {
            const url = await searchImage(m.brand, m.model);
            if (url) {
                m.url = url;
                // Veritabanındaki tüm o modele sahip araçlara url'yi ata
                db.vehicles.forEach(v => {
                    if (v.brand === m.brand && v.model === m.model) {
                        v.image_url = url;
                    }
                });
                count++;
            }
        });
        await Promise.all(promises);
        process.stdout.write(`İşlenen: ${i + chunk.length} / ${modelsToFetch.length}\r`);
    }

    console.log(`\nBulunan resim sayısı: ${count}`);
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
    console.log("Veritabanı (vehicles.json) güncellendi.");
})();
