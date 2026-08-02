import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def find_images(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        links = re.findall(r'(https?://[^"\']+\.(?:png|webp|jpg|jpeg))', html)
        links += re.findall(r'(/[^"\']+\.(?:png|webp|jpg|jpeg))', html)
        for link in set(links):
            print(link)
    except Exception as e:
        print("Error:", e)

find_images("https://www.togg.com.tr/")
find_images("https://www.togg.com.tr/t10x")
find_images("https://www.togg.com.tr/t10f")
