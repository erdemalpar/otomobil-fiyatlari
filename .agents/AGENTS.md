# ARAÇ EKLEME VE VERİ STANDARTLARI (CRITICAL)

Kullanıcı yeni bir otomobil markası eklemeni istediğinde aşağıdaki 3 kurala İSTİSNASIZ uyacaksın:

1. **Varyasyon Eksiksizliği:** Tüm araçları (ticari, binek, elektrikli vb.) ve popüler donanım paketlerini/motor seçeneklerini eksiksiz bir şekilde JSON listesine dâhil et. Sadece 1-2 örnek vererek geçiştirme.
2. **Dinamik Fiyatlandırma ZORUNLULUĞU:** Araç fiyatlarını statik/sallama olarak yazmak KESİNLİKLE YASAKTIR. Fiyatlar ilgili markanın resmi sitesinden **Puppeteer vb. web scraping botları yazılarak canlı çekilmeli** ve veritabanı (JSON) o botun çıktısıyla doldurulmalıdır. Sitenin asıl amacı bir fiyat motoru olmasıdır.
3. **Gerçek Resmi Görseller:** Kartlarda gösterilecek `image_url` kısmı baştan savma olamaz. Mutlaka markanın kendi resmi CDN sunucularından veya Wikimedia üzerinden şeffaf arkaplanlı (PNG), modelle tam eşleşen doğru araç resimleri bulunup eklenmelidir.
4. **Scraping İstisnası (Fallback ZORUNLULUĞU):** Eğer markanın web sitesi veri çekmeyi API, Captcha veya PDF yönlendirmesi ile kesin olarak engelliyorsa (Örn: BMW), 1. maddedeki varyasyon kurallarından asla taviz verilemez! Site okunamasa bile, markanın *tüm varyasyonlarını* barındıran devasa ve güncel (piyasa) fiyatlı bir "Yedek Katalog (Fallback Array)" sisteme kodlanmak ve eklenmek zorundadır.
