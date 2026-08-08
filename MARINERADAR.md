# MyCarbons (MarineRadar) - Otomatik Gemicilik Bülten & Karbon Analiz Platformu

> [!IMPORTANT]
> 🤖 **Geliştirici Ajan Yönergesi (Mandatory AI Directive):**  
> Projede tamamlanan her yeni aşama, yeni özellik geliştirme, hata düzeltmesi veya mimari değişiklik sonrasında `MARINERADAR.md` dosyasındaki **"Tamamlanan Aşamalar"** yol haritası ve **"Tamamlanan Proje Dosyaları"** listesi **SÜREKLİ VE ZORUNLU OLARAK GÜNCELLENECEKTİR.**

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

1. **IMO (International Maritime Organization) News:** Uluslararası denizcilik düzenlemeleri, CII/EEXI karbon oranları.
2. **Ship & Bunker / BunkerEx:** Denizcilik yakıt piyasaları, LNG, yeşil amonyak fiyatları ve karbon kredileri.
3. **The Maritime Executive & Splash247:** Küresel armatörlük haberleri ve filo karbonsuzlaştırma projeleri.
4. **Safety4Sea & Green4Sea:** Deniz çevresi koruma ve yeşil gemi teknolojisi bültenleri.
5. **Yeşil Liman Bültenleri (Port of Rotterdam, Port of Antwerp-Bruges):** Liman emisyon takip raporları.

---

## 🗺️ Detaylandırılmış Öğrenme Yol Haritası (Learning Roadmap)

Sıfırdan öğrenme sürecini kolaylaştırmak amacıyla kalan zorlu konular küçük, anlaşılır ve sindirilebilir aşamalara bölünmüştür:

### 🟢 Tamamlanan Aşamalar
- **Aşama 1 (TAMAMLANDI ✅):** Node.js & Express.js İlk API İskeleti ve Jest/Supertest Test Altyapısı.
- **Aşama 2 (TAMAMLANDI ✅):** Katmanlı Mimari (MVC), Dinamik Rotallar (`/api/news`, `/api/news/:id`) & Merkezi 404 Fallback.
- **Aşama 3 (TAMAMLANDI ✅):** `Nodemon` Canlı Yeniden Başlatma, `validateNews` Middleware, `POST /api/news` Endpoint'i, Merkezi Hata Yönetimi & GitHub Yayınlaması ([MarineRadar Repo](https://github.com/toygucakin/MarineRadar)).
- **Aşama 4 (TAMAMLANDI ✅):** Ortam Değişkenleri (`.env`), Mongoose & MongoDB Bağlantı Altyapısı (`src/config/db.js`), Docker & Docker Compose (`Dockerfile`, `docker-compose.yml`) Konteynırlaştırma Altyapısı.
- **Aşama 5 (TAMAMLANDI ✅):** Mongoose ODM & `News` Veri Şeması (`src/models/News.js`) Oluşturulması ve Tip/Doğrulama Kurallarının Tanımlanması.
- **Aşama 6 (TAMAMLANDI ✅):** Controller Katmanının Mongoose `async / await` Sorguları (`News.find()`, `News.findById()`, `News.create()`) ile Gerçek MongoDB CRUD Operasyonlarına Taşınması.
- **Aşama 7 (TAMAMLANDI ✅):** `rss-parser` ile İlk Otomatik Veri Kazıma Servisi (`src/services/rssService.js`), Otomatik Kategori & Etki Puanı Analizi, Çift Kayıt Engelleme (Deduplication) ve `POST /api/news/scrape/rss` Endpoint'i.
- **Aşama 8 (TAMAMLANDI ✅):** `axios` ve `cheerio` ile Advanced HTML Web Scraping Servisi (`src/services/htmlService.js`), DOM/CSS Seçicileri ile Haber Süzme ve `POST /api/news/scrape/html` Endpoint'i.
- **Aşama 9 (TAMAMLANDI ✅):** Akıllı Bülten Derleyici Modülü (`src/models/Newsletter.js`, `src/controllers/newsletterController.js`), Mongoose `.populate()` İlişkisel Haber Bağlantıları ve `POST /api/newsletters/generate` Endpoint'i.
- **Aşama 10 (TAMAMLANDI ✅):** `node-cron` ile Zamanlanmış Arka Plan Görevleri (`src/services/cronService.js`), Swagger UI Canlı İnteraktif API Dokümantasyonu (`src/config/swagger.js` & `/api-docs`).
- **Aşama 11 (TAMAMLANDI ✅):** Statik Arayüz İskeleti ve MyCarbons Light Eco Tasarım Sistemi (`public/index.html`, `public/styles.css`), Şirket web sitesi ilhamlı nane yeşili gradiyentli zemin, saf beyaz yüzen kartlar, `IMO-DCS & EU-MRV COMPLIANT` rozetleri, `MyCarbons Marine Radar` logosu, Hero İstatistik Paneli ve Express Statik Sunum.
- **Aşama 12 (TAMAMLANDI ✅):** İstemci JavaScript Mantığı & Canlı API Entegrasyonu (`public/app.js`), `/api/news` endpoint'inden canlı MongoDB verilerinin çekilmesi, dinamik DOM haber kartı oluşturma, etki puanına göre yeşil/altın rozetler ve canlı Hero istatistik hesaplamaları.
- **Aşama 13 (TAMAMLANDI ✅):** Anlık Canlı Arama, Kategori Filtreleme, Scrape API Tetikleyicileri & Toast Bildirim Sistemi (`public/app.js`, `public/styles.css`), "RSS Şimdi Kazı" ve "HTML Web Kazı" eylem butonlarının canlı backend scraping servislerine bağlanması, doğru yeni haber sayısı hesaplayıcısı ve yüzen nane yeşili toast bildirim kutuları.
- **Aşama 14 (TAMAMLANDI ✅):** Akıllı Bülten Arayüzü & Bülten Arşivi Modalı (`public/index.html`, `public/styles.css`, `public/app.js`), "Bülten Derle" butonuna tıklandığında `POST /api/newsletters/generate` API isteği atarak derlenen bülten kapağını ve seçilen haberleri şık bir dergi kapağı formatında modal pencerede açma; "Üretilen Özel Bültenler" kartına tıklandığında `GET /api/newsletters` arşivini gösterme.
- **Aşama 15 (TAMAMLANDI ✅):** Express Statik Sunum (`express.static`), Kapsamlı Jest Entegrasyon Testleri (`index.test.js` - 11/11 Test PASS), Docker Compose Altyapısı & GitHub Yayınlaması.
- **Aşama 16 (TAMAMLANDI ✅):** Haber Detay Modalı HTML İskeleti ve CSS Tasarımı (`public/index.html`, `public/styles.css`), tıklanan haberlerin başlık, kaynak, yayın tarihi, tam içerik/özet metni, etki puanı ve orijinal makale yönlendirme butonlarını içeren modern Light Eco modal yapısı.

---

### 🎉 16 Aşama Tamamlandı! Yeni İyileştirme Yol Haritası (Aşama 17-23)

MyCarbons (MarineRadar) platformunun backend servislerinden modern Light Eco web ön yüzüne ve haber detay modal tasarımına kadar 16 aşaması başarıyla tamamlanmıştır. Kalan geliştirme adımları aşağıdaki mikro aşamalarda devam etmektedir:

---

### ⏳ Gelecek Aşamalar (Geliştirme Yol Haritası)

#### 🔹 Konu 1: Haber Detay Modalı ve Tam Metin Görünümü (News Detail View)
- **Aşama 17 (BEKLEMEDE ⏳): Frontend Haber Kartı Tıklama ve Detay Gösterim Mantığı:**
  - `public/app.js` içerisindeki dinamik haber kartı oluşturucusuna tıklama olayı (`click event listener` / `data-id` mantığı) eklenerek haber detay modalının tetiklenmesi, seçilen haber verilerinin modal içerisine dinamik doldurulması ve kapatma işlevlerinin yazılması.

#### 🔹 Konu 2: HTML Web Scraping Servisi Onarımı ve Modernizasyonu (HTML Scraping Fix)
- **Aşama 18 (BEKLEMEDE ⏳): HTML Scraping Backend Hata Tespiti ve Target Site Selector Güncellemesi:**
  - `src/services/htmlService.js` içerisindeki Axios User-Agent başlıklarının (browser headers), hedef sitelerin (Safety4Sea / Splash247 / IMO) güncel CSS selector'larının ve HTML parse mantığının incelenmesi/onarılması.
- **Aşama 19 (BEKLEMEDE ⏳): HTML Scrape API Yanıt & Toast Bildirim Entegrasyonu:**
  - Frontend `public/app.js` tarafındaki HTML Scrape isteğinin backend yanıtlarına göre hata/başarı durumlarının toast bildirimlerinde ve arayüzde doğru yansıtılmasının sağlanması.

#### 🔹 Konu 3: Akıllı Bülten Derleme Algoritması Düzeltmesi (Newsletter Generator Fix)
- **Aşama 20 (BEKLEMEDE ⏳): Bülten Derleyici Backend Sorgu & Etki Puanı Threshold Analizi:**
  - `src/controllers/newsletterController.js` içerisindeki bülten derleme mantığının incelenmesi; veritabanındaki haberlerin etki puanı (`impactScore`) eşik değerleri, tarih filtreleri veya Mongoose `.populate('featuredNews')` ilişkisel sorgu uyuşmazlığının giderilerek bültenin en az 5 haber seçecek şekilde esnetilmesi.
- **Aşama 21 (BEKLEMEDE ⏳): Bülten Derleme Frontend & Dergi Kapağı Modal Render Düzeltmesi:**
  - `public/app.js` içerisindeki bülten oluşturma yanıtı işleme ve modal içerisine seçilen haber kartlarını render etme mantığının tam uyumlu hale getirilmesi.

#### 🔹 Konu 4: Anahtar Kelime Analizi ve Etiket Tabanlı Haber Filtreleme (Keyword Analysis & Tag Cloud)
- **Aşama 22 (BEKLEMEDE ⏳): Backend Anahtar Kelime Çıkarım (Keyword Extraction) & Arama API Endpoint'i:**
  - Kazınan haberlerin başlık ve özet metinlerinden en çok geçen denizcilik ve karbon terimlerinin (`IMO`, `EEXI`, `EU-MRV`, `Ammonia`, `LNG`, `Decarbonization`, `Biofuel` vb.) frekans analizi ile tespit edilmesi, `News` modeline kelime etiketleri (`keywords`) alanının eklenmesi ve `/api/news/keywords` ile `/api/news?keyword=...` endpoint'lerinin geliştirilmesi.
- **Aşama 23 (BEKLEMEDE ⏳): Dashboard Popüler Anahtar Kelime Bulutu (Keyword Tag Cloud) & Filtreleme Arayüzü:**
  - `public/index.html`, `public/styles.css` ve `public/app.js` üzerinde popüler anahtar kelimelerin tıklanabilir etiket (pill) şeklinde gösterilmesi, bir anahtar kelimeye tıklandığında sadece o kelimenin geçtiği haberlerin canlı olarak listelenmesi.

---



## 🛠️ Tamamlanan Proje Dosyaları
- [package.json](file:///c:/MyApps/MarineRadar/package.json): Paketler (`express`, `dotenv`, `mongoose`, `rss-parser`, `axios`, `cheerio`, `node-cron`, `swagger-ui-express`, `swagger-jsdoc`) ve betikler.
- [index.js](file:///c:/MyApps/MarineRadar/index.js): Express uygulaması, dotenv, DB bağlantısı, cron servisleri, Swagger UI ve rota montajları.
- [.env](file:///c:/MyApps/MarineRadar/.env): Yerel ortam değişkenleri.
- [.env.example](file:///c:/MyApps/MarineRadar/.env.example): Ortam değişkenleri şablonu.
- [src/config/db.js](file:///c:/MyApps/MarineRadar/src/config/db.js): Mongoose veritabanı bağlantı modülü.
- [src/config/swagger.js](file:///c:/MyApps/MarineRadar/src/config/swagger.js): Swagger OpenAPI 3.0 dokümantasyon konfigürasyonu.
- [src/models/News.js](file:///c:/MyApps/MarineRadar/src/models/News.js): Mongoose `News` şema ve model tanımı.
- [src/models/Newsletter.js](file:///c:/MyApps/MarineRadar/src/models/Newsletter.js): Mongoose `Newsletter` şema ve ilişkisel model tanımı.
- [src/services/rssService.js](file:///c:/MyApps/MarineRadar/src/services/rssService.js): Otomatik RSS akışı kazıma ve analiz servisi.
- [src/services/htmlService.js](file:///c:/MyApps/MarineRadar/src/services/htmlService.js): Axios & Cheerio tabanlı HTML web kazıma servisi.
- [src/services/cronService.js](file:///c:/MyApps/MarineRadar/src/services/cronService.js): Node-cron periyodik arka plan görevleri servisi.
- [Dockerfile](file:///c:/MyApps/MarineRadar/Dockerfile): Express REST API Docker imaj tanımı.
- [.dockerignore](file:///c:/MyApps/MarineRadar/.dockerignore): Docker build hariç tutma kuralları.
- [docker-compose.yml](file:///c:/MyApps/MarineRadar/docker-compose.yml): MongoDB ve API servis orkestrasyonu.
- [src/data/mockNews.js](file:///c:/MyApps/MarineRadar/src/data/mockNews.js): Mock veri seti.
- [src/controllers/newsController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsController.js): MongoDB haber asenkron iş mantığı katmanı.
- [src/controllers/newsletterController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsletterController.js): Akıllı bülten derleyici katmanı.
- [src/routes/newsRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsRoutes.js): REST haber rotaları.
- [src/routes/newsletterRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsletterRoutes.js): REST bülten rotaları.
- [src/middlewares/validateNews.js](file:///c:/MyApps/MarineRadar/src/middlewares/validateNews.js): Doğrulama katmanı.
- [src/middlewares/errorHandler.js](file:///c:/MyApps/MarineRadar/src/middlewares/errorHandler.js): Hata katmanı.
- [public/index.html](file:///c:/MyApps/MarineRadar/public/index.html): MyCarbons kurumsal kimliğine uygun web dashboard semantik HTML5 iskeleti ve IMO-DCS & EU-MRV pill rozetleri.
- [public/styles.css](file:///c:/MyApps/MarineRadar/public/styles.css): Resmi MyCarbons yaprak yeşili, turkuaz, mavi ve turuncu kurumsal renk paleti ve glassmorphism CSS tasarım sistemi.
- [public/app.js](file:///c:/MyApps/MarineRadar/public/app.js): Asenkron `fetch API` haber çekme, dinamik DOM kart oluşturucu, etki puanı rozetleri ve canlı Hero istatistik hesaplayıcısı.
- [scripts/init-env.js](file:///c:/MyApps/MarineRadar/scripts/init-env.js): `npm install` sonrasında eksik `.env` dosyasını varsayılan ayarlarla otomatik üreten betik.
- [index.test.js](file:///c:/MyApps/MarineRadar/index.test.js): MongoDB, RSS, HTML, Newsletter, Swagger UI & Statik Web Dashboard entegrasyon testleri.
