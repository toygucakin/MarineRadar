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
- **Aşama 17 (TAMAMLANDI ✅):** Frontend Haber Kartı Tıklama ve Detay Gösterim Mantığı (`public/app.js`), kullanıcılar ana sayfadaki haber kartlarına veya "Detay" butonuna tıkladığında tıklanan haberin tüm detay verilerini (`data-id`) seçerek pop-up modal pencerede canlı gösterme ve kapatma işlevleri.
- **Aşama 19 (TAMAMLANDI ✅):** HTML Scrape API Yanıt & Toast Bildirim Entegrasyonu (`public/app.js`), frontend tarafındaki HTML Scraping butonunun backend yanıtlarına göre yüzen toast bildirim kutuları ile anlık geri bildirim vermesi ve akışın senkronize güncellenmesi.
- **Aşama 20 (TAMAMLANDI ✅):** Bülten Derleyici Backend Şema ve İlişkisel Sorgu Onarımı (`src/models/Newsletter.js`, `src/controllers/newsletterController.js`), `featuredNews` ilişkisel referans dizisi ve Mongoose `.populate()` transformatör uyumunun tam buluşması.
- **Aşama 21 (TAMAMLANDI ✅):** Bülten Derleme Frontend & Dergi Kapağı Modal Render Düzeltmesi (`public/app.js`), derlenen bülten kapağında `featuredNews` dizisini eksiksiz çekerek öne çıkan 5 haberi kartlar, etki puanları ve kaynak bağlantıları ile canlı gösterme.
- **Aşama 24 (TAMAMLANDI ✅):** Global İngilizce Dil Desteği & Uluslararası Arayüz Uyumlaştırması (`public/index.html`, `public/app.js`, `src/controllers/newsletterController.js`), tüm haber içerikleri İngilizce olduğu için web dashboard, arama çubuğu, bülten kapağı, stat kartları, modal pencereler, toast bildirimleri ve tarih formatlarının tam İngilizce diline çevrilmesi.
- **Aşama 25 (TAMAMLANDI ✅):** Kazıma (Scraping) Sonrası Toast Bildirim & Akış Senkronizasyonu Düzeltmesi (`public/app.js`), haber sayısı veritabanında artmasına (ör. 138'den 139'a çıkması) rağmen arka plan cron veya doğrudan kazıma kaynaklı eşleşmelerde "0 new items found" toast bildirimi gösterilmesi sorunu, veritabanı senkronizasyon farkı (`netNewCount`) hesaplaması eklenerek tamamen çözüldü.
- **Aşama 26 (TAMAMLANDI ✅):** Fleet Status Kurumsal Gemi Logosu Güncellemesi (`public/index.html`), ana sayfadaki "Fleet Status" kartında yer alan eski ikon, resmi myCarbons web sitesinde kullanılan kule/vinç algısını engelleyen geniş U-gövdeli, pencereli yaşam mahalline ve kavisli deniz dalgalarına sahip önden görünüşlü yeşil dökme yük gemisi (Bulk Carrier front-view ship SVG) vektörel amblemi ile güncellendi.
- **Aşama 27 (TAMAMLANDI ✅):** Derin Metin Web Scraping Servisi (Deep Article Scraper Service) geliştirildi (`src/services/deepScraperService.js`). RSS ve HTML kaynaklarından çekilen haberlerin orijinal URL adreslerine (`sourceUrl`) bağlanarak gCaptain, Splash247, Marine Insight, Safety4Sea vb. denizcilik portallarının tüm makale metinleri (`fullContent`), paragrafları ve gürültüsüz temizlenmiş içerikleri kazındı. `News` modeline `fullContent`, `isFullyScraped` ve `scrapedAt` alanları eklendi. `POST /api/news/:id/scrape-deep` ve `POST /api/news/scrape/deep` REST API endpoint'leri, Swagger dokümantasyonu, Web Dashboard arayüzündeki "Deep Scrape Content" butonu, haber detay modalı derin metin göstericisi ve Jest entegrasyon testleri başarıyla yazıldı.
- **Aşama 28 (TAMAMLANDI ✅):** Gemi (`Vessel`) ve Kullanıcı (`User / Fleet`) Veri Modelleri & Filo Atama Mimarisi geliştirildi (`src/models/Vessel.js`, `src/models/User.js`, `src/data/seedFleet.js`). IMO numarası doğrulamalı Gemi şeması ve Mongoose `.populate('assignedVessels')` destekli Kullanıcı Filo şeması oluşturuldu. A Kullanıcısına (5 Gemi) ve B Kullanıcısına (3 Gemi) filolar atandı. `GET/POST /api/vessels`, `GET/POST /api/users` ve `POST /api/users/seed` REST API endpoint'leri, Swagger OpenAPI dokümanı ve Jest testleri yazıldı.
- **Aşama 29 (TAMAMLANDI ✅):** Akıllı Metin Analizör & Çoklu Gemi Varlık Eşleme Motoru (Multi-Vessel Entity Matcher) geliştirildi (`src/services/vesselMatcherService.js`). `News` modeline `matchedVessels` şeması eklendi. Haberlerin tam metinlerinde geçen gemiler IMO Numarası (Regex `\b\d{7}\b`) ve Gemi Adı kelime sınırları (`\bName\b`) taranarak tespit edildi; güven skoru (%90-%100) ve metin içi alıntı paragrafı (`mentionSnippet`) üretildi. `POST /api/news/match-vessels`, `POST /api/news/:id/match-vessels` ve `GET /api/news/vessel/:vesselId` REST API endpoint'leri, Swagger dokümanı, Web Dashboard haber kartları ve haber detay modalı gemi rozetleri ile Jest testleri yazıldı.
- **Aşama 30 (TAMAMLANDI ✅):** Regülasyon ve Emisyon Metin Analitiği (Maritime Regulation Classifier & Compliance Risk Assessor) geliştirildi (`src/services/regulationService.js`). `News` modeline `regulations` ve `complianceRisk` alanları eklendi. Metinler EU ETS, EU-MRV, IMO DCS, FuelEU Maritime, CII/EEXI, Green Corridors, Alternative Fuels ve Poseidon Principles konularına göre sınıflandırıldı. Ceza/yaptırım kelimeleri üzerinden 0.0-10.0 arası Uyumluluk Risk Skoru (Critical/High/Moderate/Low) üretildi. `POST /api/news/classify-regulations`, `POST /api/news/:id/classify-regulations` ve `GET /api/news/regulation/:code` REST API endpoint'leri, Swagger OpenAPI dokümanı, Web Dashboard regülasyon pill rozetleri, detay modalı risk paneli ve Jest testleri yazıldı.
- **Aşama 31 (TAMAMLANDI ✅):** Kullanıcı Yetkilendirme (Auth) & Kişisel Gemi Akışı REST API'leri geliştirildi (`src/middlewares/authMiddleware.js`, `src/controllers/authController.js`, `src/routes/authRoutes.js`). JWT tabanlı kimlik doğrulama katmanı eklendi. `POST /api/auth/login` (JWT token üretimi), `GET /api/auth/me` (kullanıcı profili ve atanmış gemi filosu) ve korumalı `GET /api/news/my-vessels` (oturum açan kullanıcının sadece kendi gemileriyle eşleşen özel haber akışı) REST API endpoint'leri, Swagger Bearer token dokümantasyonu ve Jest testleri yazıldı.
- **Aşama 32 (TAMAMLANDI ✅):** Frontend Kullanıcı Filosu & Gemi Odaklı Haber Dashboard Arayüzü geliştirildi (`public/index.html`, `public/app.js`). Arayüze "Account & Fleet View" kullanıcı seçici dropdown'ı (User A / User B / Public Feed), "Filter Specific Vessel" gemi seçici dropdown'ı ve "⚓ My Fleet News" özel sekmesi eklendi. Oturum açan kullanıcının yetkili gemilerine ait canlı haber bandı (Active Fleet Banner) ve dinamik JWT oturum senkronizasyonu tamamlandı.

---

### 🎉 23 Aşama Tamamlandı! Güncel İyileştirme Yol Haritası

MyCarbons (MarineRadar) platformunun backend bülten derleme motoru, ilişkisel MongoDB bağlamları, dergi kapağı modal render fonksiyonları, toast bildirim senkronizasyonları ve tam İngilizce dil entegrasyonu tamamlanmıştır. Kalan geliştirme adımları aşağıdaki mikro aşamalarda devam etmektedir:

---

### ⏳ Gelecek Aşamalar (Geliştirme Yol Haritası)

#### 🔹 Konu 2: HTML Web Scraping Servisi Onarımı ve Modernizasyonu (HTML Scraping Fix)
- **Aşama 18 (BEKLEMEDE ⏳): HTML Scraping Backend Hata Tespiti ve Target Site Selector Güncellemesi:**
  - `src/services/htmlService.js` içerisindeki Axios User-Agent başlıklarının (browser headers), hedef sitelerin (Safety4Sea / Splash247 / IMO) güncel CSS selector'larının ve HTML parse mantığının incelenmesi/onarılması.

#### 🔹 Konu 4: Anahtar Kelime Analizi ve Etiket Tabanlı Haber Filtreleme (Keyword Analysis & Tag Cloud)
- **Aşama 22 (BEKLEMEDE ⏳): Backend Anahtar Kelime Çıkarım (Keyword Extraction) & Arama API Endpoint'i:**
  - Kazınan haberlerin başlık ve özet metinlerinden en çok geçen denizcilik ve karbon terimlerinin (`IMO`, `EEXI`, `EU-MRV`, `Ammonia`, `LNG`, `Decarbonization`, `Biofuel` vb.) frekans analizi ile tespit edilmesi, `News` modeline kelime etiketleri (`keywords`) alanının eklenmesi ve `/api/news/keywords` ile `/api/news?keyword=...` endpoint'lerinin geliştirilmesi.
- **Aşama 23 (BEKLEMEDE ⏳): Dashboard Popüler Anahtar Kelime Bulutu (Keyword Tag Cloud) & Filtreleme Arayüzü:**
  - `public/index.html`, `public/styles.css` ve `public/app.js` üzerinde popüler anahtar kelimelerin tıklanabilir etiket (pill) şeklinde gösterilmesi, bir anahtar kelimeye tıklandığında sadece o kelimenin geçtiği haberlerin canlı olarak listelenmesi.

#### 🔹 Konu 5: Derin Haber Scraping, Kullanıcı-Gemi Yönetimi ve Regülasyon/Çoklu Gemi Analiz Sistemi (Deep Scraper & Multi-Vessel Fleet Analytics)

Uygulamanın yeni mimari vizyonu doğrultusunda haberlerin sadece başlık/özet seviyesinde kalmayıp, makale bağlantılarına gidilerek tüm metnin kazınması (Deep Web Scraping), kullanıcı tabanlı gemi yetkilendirmesi ve çoklu gemi tespiti yapacak modüller eklenecektir.

1. **Haber İçeriklerinin Detaylı Web Scraping'i (Deep Scraper Pipeline):**
   - RSS ve HTML akışından gelen haberlerin orijinal URL'sine (`sourceUrl`) bağlanılarak haberin tüm gövde metni (`fullContent`), yazar, yayın tarihi ve detay görselleri kazınır.
   - Bu sayede regülasyon (IMO, EU-MRV, EU ETS, CII/EEXI) ve spesifik gemi detayları ana metinden çekilebilir.

2. **Kullanıcı ve Gemi Filtreleme Altyapısı (Multi-Tenant User Fleet System):**
   - Sistemde her kullanıcının kendisiyle ilişkilendirilmiş gemi filosu tanımlanır.
   - Örn: **A Kullanıcısı** 5 gemisini, **B Kullanıcısı** 3 gemisini takip eder. Kullanıcılar sadece yetkili oldukları gemilerin veya genel regülasyon haberlerini inceler.

3. **Çoklu Gemi Tespiti ve Varlık Eşleme Motoru (Multi-Vessel Entity Matcher):**
   - Bazı denizcilik haberlerinde birden fazla gemi adı veya IMO numarası geçebilir (örn. filo satın alımları, kaza raporları, yeşil retrofit anlaşmaları).
   - Derin metin taraması ile haberin içinde geçen tüm gemiler (IMO No, Gemi Adı) tespit edilerek habere `matchedVessels` dizisi olarak eklenir.

---

##### 🗺️ Detaylı Geliştirme Aşamaları:

- **Aşama 27 (TAMAMLANDI ✅): Derin Metin Web Scraping Servisi (Deep Article Scraper Service)**
  - `src/services/deepScraperService.js` geliştirilmesi. Kazınan haberlerin `sourceUrl` bağlantısına gidilerek `Axios` ve `Cheerio` ile tam paragraf metinlerinin toplanması.
  - `News` modeline `fullContent`, `isFullyScraped` ve `scrapedAt` alanlarının eklenmesi.

- **Aşama 28 (TAMAMLANDI ✅): Gemi (Vessel) ve Kullanıcı (User / Fleet) Veri Modelleri & Veritabanı Şemaları**
  - `src/models/Vessel.js` (IMO Number, Gemi Adı, MMSI, Bayrak, Gemi Tipi, Şirket ID) ve `src/models/User.js` (Ad/Soyad, E-posta, Şifre, Rol, `assignedVessels: [Vessel._id]`) modellerinin oluşturulması.
  - Kullanıcı-Gemi ilişkisel atamalarının yapılması (A Kullanıcısı: 5 Gemi, B Kullanıcısı: 3 Gemi) ve `src/data/seedFleet.js` ile otomatik yükleme.

- **Aşama 29 (TAMAMLANDI ✅): Akıllı Metin Analizör & Çoklu Gemi Varlık Eşleme Motoru (Multi-Vessel Entity Matcher)**
  - `src/services/vesselMatcherService.js` yazılması. Derin makale metni (`fullContent`) üzerinde IMO No regex kalıpları (`IMO \d{7}`), gemi adı dizinleri ve fuzzy matching uygulanması.
  - Haber metninde 1'den fazla geçen tüm gemilerin tespit edilerek `News` modelindeki `matchedVessels: [{ vesselId, imoNumber, vesselName, confidenceScore, mentionSnippet }]` yapısına kaydedilmesi.

- **Aşama 30 (TAMAMLANDI ✅): Regülasyon ve Emisyon Metin Analitiği (Maritime Regulation Classifier)**
  - `src/services/regulationService.js` geliştirilmesi. Derin metinlerin IMO DCS, EU-MRV, EU ETS, FuelEU Maritime, CII/EEXI, Green Corridors, Biofuel/LNG/Ammonia başlıklarına göre etiketlenmesi ve gemi uyumluluk risk skorlarının hesaplanması.

- **Aşama 31 (TAMAMLANDI ✅): Kullanıcı Yetkilendirme (Auth) & Kişisel Gemi Akışı REST API'leri**
  - JWT tabanlı kimlik doğrulama (`src/middlewares/authMiddleware.js`), `POST /api/auth/login`, `GET /api/auth/me` ve kullanıcının atanmış gemilerine özel haberleri dönen `GET /api/news/my-vessels` endpoint'lerinin yazılması.

- **Aşama 32 (TAMAMLANDI ✅): Frontend Kullanıcı Filosu & Gemi Odaklı Haber Dashboard Arayüzü**
  - Web arayüzüne "My Fleet / Gemilerim" sekmesi, kullanıcı gemi filtresi dropdown'u ve haber detayında habere konu olan tüm gemilerin rozetler (Vessel Pills) ve metin içi alıntı kutuları (Context Snippets) ile gösterilmesi.

- **Aşama 33 (BEKLEMEDE ⏳): Zamanlanmış Veri Boru Hattı (Cron Scraping Pipeline) & Test Entegrasyonu**
  - Periyodik Cron görevine: 1. Feed Scrape -> 2. Deep Article Scrape -> 3. Vessel Matcher & Regulation Tagging adımlarının bağlanması ve Jest entegrasyon testlerinin güncellenmesi.

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
- [src/models/Vessel.js](file:///c:/MyApps/MarineRadar/src/models/Vessel.js): Mongoose `Vessel` (Gemi Filosu) şema ve model tanımı.
- [src/models/User.js](file:///c:/MyApps/MarineRadar/src/models/User.js): Mongoose `User` (Kullanıcı & Filo Atamaları) şema ve model tanımı.
- [src/data/seedFleet.js](file:///c:/MyApps/MarineRadar/src/data/seedFleet.js): A Kullanıcısı (5 Gemi) ve B Kullanıcısı (3 Gemi) filolarını otomatik yükleyen seeder servisi.
- [src/services/rssService.js](file:///c:/MyApps/MarineRadar/src/services/rssService.js): Otomatik RSS akışı kazıma ve analiz servisi.
- [src/services/htmlService.js](file:///c:/MyApps/MarineRadar/src/services/htmlService.js): Axios & Cheerio tabanlı HTML web kazıma servisi.
- [src/services/deepScraperService.js](file:///c:/MyApps/MarineRadar/src/services/deepScraperService.js): Orijinal haber bağlantılarından tam makale metinlerini kazıyan derin web scraping servisi.
- [src/services/vesselMatcherService.js](file:///c:/MyApps/MarineRadar/src/services/vesselMatcherService.js): Haber metinlerinden geçen filoya ait gemileri tespit eden akıllı varlık eşleme motoru.
- [src/services/regulationService.js](file:///c:/MyApps/MarineRadar/src/services/regulationService.js): Derin haber metinlerini denizcilik emisyon regülasyonlarına göre etiketleyen ve uyumluluk risk skoru (Compliance Risk) üreten servis.
- [src/services/cronService.js](file:///c:/MyApps/MarineRadar/src/services/cronService.js): Node-cron periyodik arka plan görevleri servisi.
- [Dockerfile](file:///c:/MyApps/MarineRadar/Dockerfile): Express REST API Docker imaj tanımı.
- [.dockerignore](file:///c:/MyApps/MarineRadar/.dockerignore): Docker build hariç tutma kuralları.
- [docker-compose.yml](file:///c:/MyApps/MarineRadar/docker-compose.yml): MongoDB ve Hot-Reload (Canlı kod yenileme `volume` & `CHOKIDAR_USEPOLLING`) destekli API servis orkestrasyonu.
- [src/data/mockNews.js](file:///c:/MyApps/MarineRadar/src/data/mockNews.js): Mock veri seti.
- [src/controllers/newsController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsController.js): MongoDB haber asenkron iş mantığı katmanı.
- [src/controllers/newsletterController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsletterController.js): Akıllı bülten derleyici katmanı.
- [src/controllers/vesselController.js](file:///c:/MyApps/MarineRadar/src/controllers/vesselController.js): Gemi filosu CRUD iş mantığı katmanı.
- [src/controllers/userController.js](file:///c:/MyApps/MarineRadar/src/controllers/userController.js): Kullanıcı hesabı ve gemi yetkilendirme katmanı.
- [src/controllers/authController.js](file:///c:/MyApps/MarineRadar/src/controllers/authController.js): JWT kullanıcı oturum açma ve kişisel filo kontrol katmanı.
- [src/routes/newsRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsRoutes.js): REST haber rotaları.
- [src/routes/newsletterRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsletterRoutes.js): REST bülten rotaları.
- [src/routes/vesselRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/vesselRoutes.js): REST gemi rotaları.
- [src/routes/userRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/userRoutes.js): REST kullanıcı filosu rotaları.
- [src/routes/authRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/authRoutes.js): REST JWT kimlik doğrulama rotaları.
- [src/middlewares/authMiddleware.js](file:///c:/MyApps/MarineRadar/src/middlewares/authMiddleware.js): JWT token doğrulama ve kullanıcı filo yetki katmanı.
- [src/middlewares/validateNews.js](file:///c:/MyApps/MarineRadar/src/middlewares/validateNews.js): Doğrulama katmanı.
- [src/middlewares/errorHandler.js](file:///c:/MyApps/MarineRadar/src/middlewares/errorHandler.js): Hata katmanı.
- [public/index.html](file:///c:/MyApps/MarineRadar/public/index.html): MyCarbons kurumsal kimliğine uygun web dashboard semantik HTML5 iskeleti ve IMO-DCS & EU-MRV pill rozetleri.
- [public/styles.css](file:///c:/MyApps/MarineRadar/public/styles.css): Resmi MyCarbons yaprak yeşili, turkuaz, mavi ve turuncu kurumsal renk paleti ve glassmorphism CSS tasarım sistemi.
- [public/app.js](file:///c:/MyApps/MarineRadar/public/app.js): Asenkron `fetch API` haber çekme, dinamik DOM kart oluşturucu, etki puanı rozetleri ve canlı Hero istatistik hesaplayıcısı.
- [scripts/init-env.js](file:///c:/MyApps/MarineRadar/scripts/init-env.js): `npm install` sonrasında eksik `.env` dosyasını varsayılan ayarlarla otomatik üreten betik.
- [index.test.js](file:///c:/MyApps/MarineRadar/index.test.js): MongoDB, RSS, HTML, Newsletter, Vessel, User, Auth, Swagger UI & Statik Web Dashboard entegrasyon testleri.
