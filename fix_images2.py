import json
import urllib.request
import urllib.parse
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_wiki_image(query):
    # Search wikimedia commons instead of english wikipedia might give better raw car photos, but en.wikipedia page images are more curated.
    # Let's search en.wikipedia first.
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, context=ctx).read()
        data = json.loads(response)
        
        if not data.get('query', {}).get('search'):
            return None
            
        title = data['query']['search'][0]['title']
        
        # Get thumbnail
        img_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=800"
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        img_res = urllib.request.urlopen(req, context=ctx).read()
        img_data = json.loads(img_res)
        
        pages = img_data['query']['pages']
        for page_id in pages:
            if 'thumbnail' in pages[page_id]:
                return pages[page_id]['thumbnail']['source']
    except Exception as e:
        pass
    return None

def main():
    path = "public/data/vehicles.json"
    with open(path, 'r') as f:
        db = json.load(f)
        
    updated = 0
    total_null = 0
    # Create a cache to avoid hitting wiki API for the same brand+model repeatedly
    cache = {}
    
    for vehicle in db['vehicles']:
        if not vehicle.get('image_url'):
            total_null += 1
            brand = vehicle['brand']
            model = vehicle['model']
            
            # Remove redundant brand from model name if any, some models might be "Volvo XC90"
            query = f"{brand} {model}"
            
            if query in cache:
                img = cache[query]
            else:
                img = get_wiki_image(query)
                if not img:
                    # try only model
                    img = get_wiki_image(model)
                cache[query] = img
                # slight delay to prevent rate limit
                time.sleep(0.1)
                
            if img:
                vehicle['image_url'] = img
                updated += 1
                print(f"Updated {query} -> {img}")
            else:
                print(f"Could not find image for {query}")
                
    with open(path, 'w') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        
    print(f"Updated {updated}/{total_null} null images.")

if __name__ == "__main__":
    main()
