import urllib.request
import json
import re

def search_duckduckgo_images(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # This is basic, might not yield image URLs directly if they are protected
        # Let's try to just find some raw URLs
        return html
    except Exception as e:
        return str(e)

html = search_duckduckgo_images("Togg T10X png transparent")
matches = re.findall(r'src="(//external-content\.duckduckgo\.com/[^"]+)"', html)
for m in matches[:5]:
    print("https:" + m)
