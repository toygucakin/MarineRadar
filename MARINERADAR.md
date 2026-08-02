# MyCarbons (MarineRadar) - Otomatik Gemicilik Bülten & Karbon Analiz Platformu

## ⚓ Uygulamanın Vizyonu ve Temel Özellikleri

**MyCarbons (MarineRadar)**; Node.js, Express.js, REST API ve MongoDB teknolojilerini kullanarak küresel gemicilik ve deniz taşımacılığı bültenlerinden **otomatik veri kazıma (Web Scraping / Data Harvesting)** yapan, elde edilen verileri anlamlandırıp kendi özel denizcilik ve karbon emisyonu bültenlerini oluşturan akıllı bir backend sistemidir.

### 🌟 Ana İşlevler ve Sistem Bileşenleri
1. **Otomatik Veri Kazıma (Web Scraping & RSS Service):**
   - Küresel denizcilik haber siteleri ve sektörel bültenlerden düzenli aralıklarla (Cron Jobs) haber, rapor ve emisyon verilerini toplar.
2. **Veri Temizleme & Çift Kayıt Engelleme (Deduplication & Normalization):**
   - Kazınan ham verileri (HTML/RSS) temizler, aynı haberin tekrar eklenmesini engeller ve standart JSON yapısına dönüştürür.
3. **Akıllı Bülten Derleyici (Automated Newsletter Generator):**
   - Karbon emisyonu, yeşil limanlar ve alternatif yakıtlar gibi kategorilere göre en yüksek etki puanına (`impactScore`) sahip haberleri seçerek günlük/haftalık **MyCarbons Özel Bülteni** oluşturur.
4. **MongoDB Veri Katmanı:**
   - Kazınan tüm makaleleri, bülten arşivlerini, kaynak metadatalarını ve kullanıcı tercihlerini esnek MongoDB (Mongoose) koleksiyonlarında saklar.
5. **REST API & Test Mühendisliği:**
   - Frontend uygulamalarına veya üçüncü parti servislere veri sağlayan Express.js REST API katmanı ve Jest/Supertest ile otomatize edilmiş entegrasyon testleri.

---

## 📰 Veri Kazınacak Hedef Gemicilik Bültenleri ve Kaynakları

Sistemin veri toplayacağı temel denizcilik ve karbon emisyon haber kaynakları:

1. **IMO (International Maritime Organization) News:**
   - *Kapsam:* Uluslararası denizcilik düzenlemeleri, CII/EEXI karbon oranları ve resmi IMO duyuruları.
   - *Yöntem:* Official Press Releases Scraping & RSS.
2. **Ship & Bunker / BunkerEx:**
   - *Kapsam:* Denizcilik yakıt piyasaları, LNG, yeşil amonyak, hidrojen fiyatları ve karbon kredisi bültenleri.
   - *Yöntem:* Cheerio / Axios HTML Scraping.
3. **The Maritime Executive & Splash247:**
   - *Kapsam:* Küresel armatörlük haberleri, filo karbonsuzlaştırma stratejileri ve yeşil koridor projeleri.
   - *Yöntem:* RSS Feed Parser & HTML Scraping.
4. **Safety4Sea & Green4Sea:**
   - *Kapsam:* Deniz çevresi koruma, sürdürülebilirlik raporları ve yeşil gemi teknolojisi bültenleri.
   - *Yöntem:* RSS & Article Extraction.
5. **Yeşil Liman Bültenleri (Port of Rotterdam, Port of Antwerp-Bruges):**
   - *Kapsam:* Avrupa limanlarındaki emisyon takip raporları ve elektrikli şarj/römorkör gelişmeleri.

---

## 🏗️ Projenin Mimari Yapılanması ve Geliştirme Adımları

Projeyi adım adım modüler ve ölçeklenebilir bir mimaride şöyle inşa edeceğiz:

```text
               ┌─────────────────────────────────────────────────────────┐
               │           Hedef Bültenler & Web Kaynakları               │
               │  (IMO, Ship&Bunker, Maritime Executive, Safety4Sea)     │
               └───────────────────────────┬─────────────────────────────┘
                                           │ (Cron Job / Cheerio / Axios)
                                           ▼
               ┌─────────────────────────────────────────────────────────┐
               │              Scraper & Data Parser Modülü               │
               │     (Veri Kazıma, Temizleme & Deduplication)             │
               └───────────────────────────┬─────────────────────────────┘
                                           │
                                           ▼
               ┌─────────────────────────────────────────────────────────┐
               │                  MongoDB Veritabanı                     │
               │        (Collections: news, newsletters, sources)        │
               └───────────────────────────┬─────────────────────────────┘
                                           │
                                           ▼
               ┌─────────────────────────────────────────────────────────┐
               │               Express.js REST API Katmanı                │
               │     (GET /api/news, POST /api/newsletters/generate)     │
               └───────────────────────────┬─────────────────────────────┘
                                           │
                                           ▼
               ┌─────────────────────────────────────────────────────────┐
               │          Otomatik Test Suite (Jest & Supertest)         │
               └─────────────────────────────────────────────────────────┘
```

### Önerilen Teknolojik Araçlar:
- **Web Scraping:** `axios` + `cheerio` (Statik HTML kazıma için) veya `rss-parser` (RSS akışları için).
- **Veritabanı (Database):** `mongoose` (MongoDB ORM/ODM kütüphanesi).
- **Zamanlanmış Görevler:** `node-cron` (Otomatik günlük kazıma için).
- **REST API & Testing:** `express`, `jest`, `supertest`.

---

## 🗺️ Sıfırdan İlerleme Yol Haritası (Learning Roadmap)

### Aşama 1: Temel Mimarinin Kurulması (TAMAMLANDI ✅)
- ES Modules (`"type": "module"`) standartlarında ilk API iskeleti.
- Jest & Supertest ilk entegrasyon testi.
- Postman ile manuel doğrulama.

### Aşama 2: API'yi Genişletme ve Katmanlı Mimari (TAMAMLANDI ✅)
- Katmanlı Mimari (MVC - Data, Controller, Route modülleri).
- `GET /api/news` ve `GET /api/news/:id` dinamik endpointleri.
- Merkezi 404 Fallback Middleware.

### Aşama 3: Giriş Doğrulama (Validation), Hata Yönetimi & POST Endpoint (TAMAMLANDI ✅)
- `nodemon` canlı geliştirme desteği.
- `src/middlewares/validateNews.js` ile istek doğrulama.
- `src/middlewares/errorHandler.js` merkezi hata yönetimi.
- `POST /api/news` haber ekleme rotası ve 6/6 geçen Jest testleri.
- GitHub deposuna aktarım ([MarineRadar Repository](https://github.com/toygucakin/MarineRadar)).

### Aşama 4: MongoDB Veritabanı ve Mongoose Entegrasyonu (Gelecek Adım ⏳)
- MongoDB Atlas / Local MongoDB bağlantısı.
- Mongoose `News` ve `Newsletter` şemalarının tanımlanması.
- Mock verilerden veritabanı CRUD operasyonlarına geçiş.

### Aşama 5: Web Scraping Modülü & Bülten Oluşturucu (Gelecek Adım ⏳)
- `axios`, `cheerio` ve `rss-parser` ile denizcilik kaynaklarından canlı veri kazıma.
- `node-cron` ile günlük otomatik bülten derleme algoritması.

---

## 🛠️ Tamamlanan Proje Dosyaları
- [package.json](file:///c:/MyApps/MarineRadar/package.json): Paketler ve betikler.
- [index.js](file:///c:/MyApps/MarineRadar/index.js): Express uygulaması ve rota konfigürasyonu.
- [src/data/mockNews.js](file:///c:/MyApps/MarineRadar/src/data/mockNews.js): Mock veri seti.
- [src/controllers/newsController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsController.js): İş mantığı katmanı.
- [src/routes/newsRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsRoutes.js): REST rotaları.
- [src/middlewares/validateNews.js](file:///c:/MyApps/MarineRadar/src/middlewares/validateNews.js): Doğrulama katmanı.
- [src/middlewares/errorHandler.js](file:///c:/MyApps/MarineRadar/src/middlewares/errorHandler.js): Hata katmanı.
- [index.test.js](file:///c:/MyApps/MarineRadar/index.test.js): Entegrasyon testleri.
