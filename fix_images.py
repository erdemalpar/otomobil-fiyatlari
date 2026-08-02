import json
import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_wiki_image(query):
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, context=ctx).read()
        data = json.loads(response)
        
        if not data['query']['search']: return None
        title = data['query']['search'][0]['title']
        
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
    path = "/Users/erdem/.gemini/antigravity/scratch/Otomobil Fiyatları/public/data/vehicles.json"
    with open(path, 'r') as f:
        db = json.load(f)
        
    for vehicle in db['vehicles']:
        brand = vehicle['brand']
        model = vehicle['model']
        query = f"{brand} {model}"
        img = get_wiki_image(query)
        if img:
            vehicle['image_url'] = img
            print(f"Updated {query}")
            
    with open(path, 'w') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
