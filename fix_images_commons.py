import json
import urllib.request
import urllib.parse
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_commons_image(query):
    # search wikimedia commons for file
    search_url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query + ' filetype:bitmap')}&srnamespace=6&format=json&srlimit=3"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, context=ctx).read()
        data = json.loads(res)
        
        search_results = data.get('query', {}).get('search', [])
        if not search_results:
            return None
            
        title = search_results[0]['title']
        
        # get image url for this file
        img_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        img_res = urllib.request.urlopen(req, context=ctx).read()
        img_data = json.loads(img_res)
        
        pages = img_data['query']['pages']
        for page_id in pages:
            if 'imageinfo' in pages[page_id]:
                return pages[page_id]['imageinfo'][0]['url']
    except Exception as e:
        pass
    return None

def main():
    path = "public/data/vehicles.json"
    with open(path, 'r') as f:
        db = json.load(f)
        
    updated = 0
    cache = {}
    
    for vehicle in db['vehicles']:
        if not vehicle.get('image_url') or "BMW_N20" in vehicle.get('image_url', ''):
            brand = vehicle['brand']
            model = vehicle['model']
            
            # special case cleanup
            if brand in model:
                query = model
            else:
                query = f"{brand} {model}"
                
            # clean up some words that break search
            query = query.replace("Serisi", "Series").replace("Yeni", "").strip()
            
            if query in cache:
                img = cache[query]
            else:
                img = get_commons_image(query)
                if not img:
                    img = get_commons_image(brand + " " + model.split()[0])
                cache[query] = img
                time.sleep(0.1)
                
            if img:
                vehicle['image_url'] = img
                updated += 1
                print(f"Updated {query} -> {img}")
            else:
                print(f"Could not find {query}")
                
    with open(path, 'w') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        
    print(f"Updated {updated} remaining images.")

if __name__ == "__main__":
    main()
