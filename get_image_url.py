import urllib.request
import json
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_image_url(filename):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles={urllib.parse.quote(filename)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        data = json.loads(response)
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_info in pages.items():
            image_info = page_info.get('imageinfo', [])
            if image_info:
                print(image_info[0].get('url'))
    except Exception as e:
        print("Error:", e)

get_image_url("File:First Togg T10X.png")
