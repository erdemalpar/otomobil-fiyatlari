const fs = require('fs');
const path = require('path');
const https = require('https');

const delay = ms => new Promise(res => setTimeout(res, ms));

const fetchJson = async (url) => {
  await delay(1000); // Rate limit için bekle
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'OtomobilFiyatlariBot/1.0 (erdem)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
          try {
              resolve(JSON.parse(data));
          } catch(e) {
              console.log("API Error:", data);
              resolve({query: {pages: {}, search: []}});
          }
      });
    });
    req.on('error', reject);
  });
};

const findImage = async (brand, model) => {
  try {
    if (brand === 'Togg' && model === 'T10F') {
       return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Togg_T10F_Sedan.jpg/800px-Togg_T10F_Sedan.jpg';
    }

    let title = `${brand}_${model}`.replace(/ /g, '_');
    let url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=960`;
    let data = await fetchJson(url);
    if(data.query && data.query.pages) {
        let pages = data.query.pages;
        let pageId = Object.keys(pages)[0];
        if (pageId && pageId !== "-1" && pages[pageId].thumbnail) return pages[pageId].thumbnail.source;
    }

    title = `${model}`.replace(/ /g, '_');
    url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=960`;
    data = await fetchJson(url);
    if(data.query && data.query.pages) {
        let pages = data.query.pages;
        let pageId = Object.keys(pages)[0];
        if (pageId && pageId !== "-1" && pages[pageId].thumbnail) return pages[pageId].thumbnail.source;
    }

    let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(brand + ' ' + model)}&utf8=&format=json`;
    let searchData = await fetchJson(searchUrl);
    if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
        let searchTitle = searchData.query.search[0].title;
        let imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(searchTitle)}&prop=pageimages&format=json&pithumbsize=960`;
        let imgData = await fetchJson(imgUrl);
        if(imgData.query && imgData.query.pages) {
            let imgPages = imgData.query.pages;
            let imgPageId = Object.keys(imgPages)[0];
            if (imgPageId && imgPageId !== "-1" && imgPages[imgPageId].thumbnail) return imgPages[imgPageId].thumbnail.source;
        }
    }
  } catch (err) {
    console.error("Error finding image for", brand, model, err.message);
  }
  return null;
};

const main = async () => {
  const dbPath = path.join(__dirname, 'public', 'data', 'vehicles.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  let updatedCount = 0;
  for (const vehicle of db.vehicles) {
     console.log(`Searching image for ${vehicle.brand} ${vehicle.model}...`);
     let img = await findImage(vehicle.brand, vehicle.model);
     
     if (!img) {
         let simpleModel = vehicle.model.replace(/Electric|Gen-E|Van|Kamyonet|Custom|Minibüs/g, '').trim();
         if (simpleModel !== vehicle.model) {
             console.log(`Trying simpler name: ${vehicle.brand} ${simpleModel}`);
             img = await findImage(vehicle.brand, simpleModel);
         }
     }
     
     if (img) {
        vehicle.image_url = img;
        updatedCount++;
        console.log(`-> Found: ${img}`);
     } else {
        console.log(`-> NOT FOUND`);
     }
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`Total updated: ${updatedCount}/${db.vehicles.length}`);
};

main();
