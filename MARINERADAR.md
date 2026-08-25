# MyCarbons (MarineRadar) - Otomatik Gemicilik Bülten & Karbon Analiz Platformu

> [!IMPORTANT]
> 🤖 **Geliştirici Ajan Yönergesi (Mandatory AI Directive):**  
> Projede tamamlanan her yeni aşama, yeni özellik geliştirme, hata düzeltmesi veya mimari değişiklik sonrasında `MARINERADAR.md` dosyasındaki **"Tamamlanan Aşamalar"** yol haritası ve **"Tamamlanan Proje Dosyaları"** listesi **SÜREKLİ VE ZORUNLU OLARAK GÜNCELLENECEKTİR.**

## ⚓ Uygulamanın Vizyonu ve Temel Özellikleri

**MyCarbons (MarineRadar)**; Node.js, Express.js, REST API ve MongoDB teknolojilerini kullanarak küresel denizcilik ve karbonsuzlaştırma bültenlerinden **otomatik veri kazıma (Web Scraping / Data Harvesting)** yapan, elde edilen verileri anlamlandırıp kendi özel denizcilik ve karbon emisyonu bültenlerini oluşturan akıllı bir backend ve frontend platformudur.

### 🌟 Ana İşlevler ve Sistem Bileşenleri
1. **Otomatik Veri Kazıma (Web Scraping & RSS Service):**
   - Küresel denizcilik haber siteleri ve sektörel bültenlerden düzenli aralıklarla (Cron Jobs) haber, rapor ve emisyon verilerini toplar.
2. **Derin Makale Kazıma & Metin Analitiği (Deep Article Scraper & Analytics):**
   - Orijinal haber bağlantılarına giderek tam makale metinlerini kazır (`fullContent`), IMO numarası ve gemi isimleri üzerinden filo gemilerini eşleştirir (`matchedVessels`) ve regülasyon uyumluluk risk skorlarını hesaplar (`complianceRisk`).
3. **Kullanıcı Yetkilendirme & Kişisel Filo Yönetimi (User Auth & Fleet System):**
   - JWT token tabanlı giriş yapma, kullanıcılara özel gemi filosu atama (`assignedVessels`), filoya gemi ekleme/çıkarma (`POST/DELETE /api/users/:id/vessels`) ve kişiselleştirilmiş haber akışına erişim.
4. **Akıllı Bülten Derleyici (Automated Newsletter Generator):**
   - Karbon emisyonu, yeşil limanlar ve alternatif yakıtlar gibi kategorilere göre en yüksek etki puanına (`impactScore`) sahip haberleri seçerek günlük/haftalık **MyCarbons Özel Bülteni** oluşturur ve arşivler.
5. **Dinamik Web Dashboard & Akıllı Sayfalama (Pagination Engine):**
   - Nane yeşili eco-design temalı interaktif arayüz, 15 haber/sayfa sınırlaması ve yığılmayı önleyen akıllı kısaltmalı sayfalama çubuğu (`1 2 3 4 5 ... N`).
6. **MongoDB Veri Katmanı & REST API Test Mühendisliği:**
   - Esnek MongoDB (Mongoose) koleksiyonları, Swagger UI canlı dokümantasyonu ve 22 tam geçen Jest entegrasyon testi.

---

## 🟢 Tamamlanan Aşamalar (Completed Phases)

- **Aşama 1 (TAMAMLANDI ✅):** Node.js & Express.js İlk API İskeleti ve Jest/Supertest Test Altyapısı.
- **Aşama 2 (TAMAMLANDI ✅):** Katmanlı Mimari (MVC), Dinamik Rotalar (`/api/news`, `/api/news/:id`) & Merkezi 404 Fallback.
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
- **Aşama 13 (TAMAMLANDI ✅):** Anlık Canlı Arama, Kategori Filtreleme, Scrape API Tetikleyicileri & Toast Bildirim Sistemi (`public/app.js`, `public/styles.css`), eylem butonlarının canlı backend scraping servislerine bağlanması ve yüzen nane yeşili toast bildirim kutuları.
- **Aşama 14 (TAMAMLANDI ✅):** Akıllı Bülten Arayüzü & Bülten Arşivi Modalı (`public/index.html`, `public/styles.css`, `public/app.js`), derlenen bülten kapağını şık bir dergi kapağı formatında modal pencerede açma ve arşiv listesi.
- **Aşama 15 (TAMAMLANDI ✅):** Express Statik Sunum (`express.static`), Kapsamlı Jest Entegrasyon Testleri (`index.test.js` - 22/22 Test PASS), Docker Compose Altyapısı & GitHub Yayınlaması.
- **Aşama 16 (TAMAMLANDI ✅):** Haber Detay Modalı HTML İskeleti ve CSS Tasarımı (`public/index.html`, `public/styles.css`).
- **Aşama 17 (TAMAMLANDI ✅):** Frontend Haber Kartı Tıklama ve Detay Gösterim Mantığı (`public/app.js`).
- **Aşama 19 (TAMAMLANDI ✅):** HTML Scrape API Yanıt & Toast Bildirim Entegrasyonu (`public/app.js`).
- **Aşama 20 (TAMAMLANDI ✅):** Bülten Derleyici Backend Şema ve İlişkisel Sorgu Onarımı (`src/models/Newsletter.js`, `src/controllers/newsletterController.js`).
- **Aşama 21 (TAMAMLANDI ✅):** Bülten Derleme Frontend & Dergi Kapağı Modal Render Düzeltmesi (`public/app.js`).
- **Aşama 24 (TAMAMLANDI ✅):** Global İngilizce Dil Desteği & Uluslararası Arayüz Uyumlaştırması (`public/index.html`, `public/app.js`, `src/controllers/newsletterController.js`).
- **Aşama 25 (TAMAMLANDI ✅):** Kazıma Sonrası Toast Bildirim & Akış Senkronizasyonu Düzeltmesi (`public/app.js`).
- **Aşama 26 (TAMAMLANDI ✅):** Fleet Status Kurumsal Gemi Logosu Güncellemesi (`public/index.html`).
- **Aşama 27 (TAMAMLANDI ✅):** Derin Metin Web Scraping Servisi (Deep Article Scraper Service) geliştirildi (`src/services/deepScraperService.js`). Orijinal haber bağlantılarından tam makale metinleri (`fullContent`) kazındı.
- **Aşama 28 (TAMAMLANDI ✅):** Gemi (`Vessel`) ve Kullanıcı (`User / Fleet`) Veri Modelleri & Filo Atama Mimarisi geliştirildi (`src/models/Vessel.js`, `src/models/User.js`, `src/data/seedFleet.js`).
- **Aşama 29 (TAMAMLANDI ✅):** Akıllı Metin Analizör & Çoklu Gemi Varlık Eşleme Motoru (`src/services/vesselMatcherService.js`). Haber metinlerinden geçen filoya ait gemilerin tespiti (`matchedVessels`).
- **Aşama 30 (TAMAMLANDI ✅):** Regülasyon ve Emisyon Metin Analitiği (`src/services/regulationService.js`). EU ETS, EU-MRV, IMO DCS, FuelEU Maritime etiketlemesi ve Uyumluluk Risk Skoru (Compliance Risk) hesabı.
- **Aşama 31 (TAMAMLANDI ✅):** Kullanıcı Yetkilendirme (Auth) & Kişisel Gemi Akışı REST API'leri (`src/middlewares/authMiddleware.js`, `src/controllers/authController.js`, `src/routes/authRoutes.js`). JWT kimlik doğrulama ve `/api/news/my-vessels` korumalı akış.
- **Aşama 32 (TAMAMLANDI ✅):** Frontend Kullanıcı Filosu & Gemi Odaklı Haber Dashboard Arayüzü (`public/index.html`, `public/app.js`).
- **Aşama 33 (TAMAMLANDI ✅):** Zamanlanmış 4 Aşamalı Tam Veri Boru Hattı (`src/services/cronService.js`). 1. Scrape ➔ 2. Deep Scrape ➔ 3. Vessel Matcher ➔ 4. Regulation Tagging uçtan uca boru hattı.
- **Aşama 34 (TAMAMLANDI ✅):** Üst Menü "Login / My Fleet" Modalı & Gemi Ekle/Çıkar Yönetimi (`src/controllers/userController.js`, `src/routes/userRoutes.js`). E-posta ve şifre ile oturum açma, filoya yeni gemi ekleme (`POST /api/users/:id/vessels`) ve filodan gemi çıkarma (`DELETE /api/users/:id/vessels/:vesselId`).
- **Aşama 35 (TAMAMLANDI ✅):** Akıllı Sayfa Kısaltma Motoru (Smart Truncated Pagination Engine) geliştirildi (`public/app.js`, `public/styles.css`). Haber akışı 15 haber/sayfa limitine bölündü. Sayfa sayısı kaç olursa olsun ekranı kaplamayan `1 2 3 4 5 ... N` formatında üç nokta kısaltmalı kompakt sayfalama çubuğu entegre edildi.
- **Aşama 36 (TAMAMLANDI ✅):** Üst Menü Kullanıcı Rozeti & Modal İçi Modernized Gemi Silme Butonları (`public/styles.css`, `public/app.js`). Üst menü butonları yeşil zümrüt degrade temaya dönüştürüldü, modal içi pembe silme butonları yerine ikonlu modern `.btn-remove-vessel` butonları tasarlandı.
- **Aşama 37 (TAMAMLANDI ✅):** Kullanıcıya Özel Gemi Seçici Dropdown & Varsayılan Kişisel Bülten Yükleyici (`public/app.js`, `public/index.html`). Oturum açıldığında arama çubuğunun yanındaki dropdown otomatik olarak kullanıcının kendi gemilerini (`⚓ My Assigned Vessels`) gösterir ve varsayılan haber akışı kullanıcının kendi gemilerine ayarlanır. Ayrıca dropdown içerisine `🌐 All Public News (Genel Haberler)` geçiş opsiyonu eklendi.
- **Aşama 38 (TAMAMLANDI ✅):** Yapay Zeka Entegrasyon Altyapısı & API Anahtarı Konfigürasyonu (`.env`, `.env.example`, `package.json`, `scripts/init-env.js`). `@google/generative-ai` SDK paketi projeye dahil edildi, kullanıcının Gemini API anahtarı `.env` dosyasına güvenli şekilde gömüldü ve `GEMINI_MODEL=gemini-flash-latest` model konfigürasyonu tamamlandı.
- **Aşama 39 (TAMAMLANDI ✅):** Mongoose Haber Veri Modeli (`src/models/News.js`) Yapay Zeka Alanları Revizyonu. Mongoose `newsSchema` nesnesine `aiNote`, `aiVessels`, `aiImportanceScore`, `aiCategorized` ve `aiAnalyzedAt` alanları eklendi.
- **Aşama 40 (TAMAMLANDI ✅):** Google Gemini AI Analiz Servisi (`src/services/geminiService.js`). Prompt mühendisliği ile yapılandırılmış JSON çıktısı istenerek denizcilik emisyonu ve karbonsuzlaşma odaklı Türkçe analiz yorumu (`aiNote`), otomatik kategori seçimi (`category`), hassas etki skoru (`aiImportanceScore`) ve gemi varlık tespiti (`aiVessels`) gerçekleştiren `analyzeNewsWithGemini` ve `analyzeAllUnprocessedNewsWithGemini` servisleri geliştirildi.
- **Aşama 41 (TAMAMLANDI ✅):** REST API Controller & Rota Katmanı Entegrasyonu (`src/controllers/newsController.js`, `src/routes/newsRoutes.js`, `src/config/swagger.js`). `POST /api/news/:id/ai-analyze` ve `POST /api/news/ai-analyze` endpoint'leri eklendi, Swagger UI canlı dokümantasyonuna entegre edildi.

---

## 🔮 Gelecek Aşamalar (Planned Roadmap / Future Phases)

- **Aşama 42 (PLANLANDI ⏳):** Otomatik Zamanlanmış Boru Hattının 5 Aşamaya Yükseltilmesi (`src/services/cronService.js`).
  - `runFullPipeline` boru hattı 5 Aşamalı Tam Akıllı Boru Hattı'na (`5-Stage AI Scraping Pipeline`) dönüştürülecek:
    1. **Stage 1:** RSS & HTML Feed Ingestion
    2. **Stage 2:** Deep Article Content Scraper
    3. **Stage 3:** Multi-Vessel Entity Matcher
    4. **Stage 4:** Regulation Tagging & Risk Assessor
    5. **Stage 5 (YENİ ✅):** Google Gemini AI Commentary, Vessel Extraction, Importance Score & Categorization Engine.

- **Aşama 43 (PLANLANDI ⏳):** Frontend Haber Detay Modalı & Yapay Zeka Analiz Kartı Tasarımı (`public/index.html`, `public/styles.css`, `public/app.js`).
  - Detay modalına nane/zümrüt ve mor gradiyentli **🤖 Yapay Zeka Analiz Notu (Gemini AI Commentary)** kartının eklenmesi.
  - Modal içerisine **🚢 Yapay Zeka Tarafından Tespit Edilen Gemiler** ve **⭐ Yapay Zeka Önem Skoru** gösterge kutularının eklenmesi.
  - Modal içine anlık **"🤖 AI ile Analiz Et & Yorumla"** tetikleme butonunun eklenmesi.

- **Aşama 44 (PLANLANDI ⏳):** Frontend Akış Kartları & Kategori Filtreleme Revizyonu (`public/app.js`, `public/styles.css`).
  - Haber kartlarında Gemini AI tarafından kategorize edilen etiketlerin (Örn: `Alternative Fuels`) canlı gösterimi.
  - Kartlarda AI Analizi Yapıldı rozetinin (`🤖 AI Analyzed`) konumlandırılması.
  - Kategori filtre barında `Alternative Fuels` sekmesinin aktifleştirilmesi.

- **Aşama 45 (PLANLANDI ⏳):** Otomatik Entegrasyon Testleri ve Sistem Doğrulaması (`index.test.js`).
  - Jest & Supertest entegrasyon testlerinin 22'den yeni AI endpoint'leri ile genişletilmesi.
  - Veritabanı ve Gemini servis yanıtlarının test ortamında doğrulanması.

---

## 🏗️ Geliştirme Revizyonları ve Mimarisi (Technical Revisions & Architecture)

### 1. Yapay Zeka Model ve Entegrasyon Stratejisi
- **Kullanılan Model:** `gemini-1.5-flash` / `gemini-flash-latest` (Google Generative AI).
- **Kimlik Doğrulama:** Ortam değişkeni üzerinden `GEMINI_API_KEY` ile API çağrıları yapılır.
- **Performans & Gecikme:** Flash modelinin yüksek hızı sayesinde haber başına ortalama ~1.2 saniye yanıt süresi elde edilmesi hedeflenmektedir.

### 2. Prompt Mühendisliği ve Yapılandırılmış Yanıt (Structured Output)
Gemini AI'ya iletilecek sistem prompt'u denizcilik, IMO regülasyonları ve karbonsuzlaştırma terminolojisine göre özelleştirilmiştir. Çıktı formatı strict JSON olarak zorlanacaktır:
```json
{
  "aiNote": "Gemini AI tarafından haber içeriğinin denizcilik emisyonları, karbon yakalama ve ticari filolara etkisi üzerine yazılmış Türkçe detay yorumu...",
  "category": "Alternative Fuels",
  "importanceScore": 8.8,
  "mentionedVessels": ["M/T Aegean Green", "IMO 9876543", "Ever Given"]
}
```

### 3. Veritabanı Şema Geliştirme Revizyonu (`News.js`)
Mongoose `newsSchema` nesnesine aşağıdaki 5 yeni alan eklenecektir:
```javascript
aiNote: { type: String, trim: true, default: null },
aiVessels: [{ type: String, trim: true }],
aiImportanceScore: { type: Number, min: 0, max: 10, default: null },
aiCategorized: { type: Boolean, default: false },
aiAnalyzedAt: { type: Date, default: null }
```

### 4. 5 Aşamalı Veri Boru Hattı (5-Stage Scraping Pipeline Architecture)
```
[1. RSS/HTML Ingestion] ➔ [2. Deep Scraper] ➔ [3. Vessel Matcher] ➔ [4. Regulation Tagging] ➔ [5. Gemini AI Engine]
```
Her aşama bağımsız çalışabildiği gibi `runFullPipeline` fonksiyonu ile sırayla otomatik olarak da yürütülür.

### 5. UI/UX Tasarım ve Etkileşim Revizyonu
- **Renk Paleti:** Zümrüt yeşili (`#059669`) ile yapay zeka temasını temsil eden parlak mor/violet (`#7C3AED`) degradesi harmanlanacaktır.
- **Haber Detay Modalı:** Kullanıcı bir habere tıkladığında, makalenin orijinal özeti ve ham metninin hemen altında **"🤖 Yapay Zeka Değerlendirme Notu"** özel bir vurgu kutusunda gösterilecektir.

---

## 🛠️ Tamamlanan Proje Dosyaları

- [package.json](file:///c:/MyApps/MarineRadar/package.json): Paketler (`express`, `dotenv`, `mongoose`, `rss-parser`, `axios`, `cheerio`, `node-cron`, `jsonwebtoken`, `swagger-ui-express`, `swagger-jsdoc`, `@google/generative-ai`) ve betikler.
- [index.js](file:///c:/MyApps/MarineRadar/index.js): Express uygulaması, dotenv, DB bağlantısı, cron servisleri, Swagger UI ve rota montajları.
- [.env](file:///c:/MyApps/MarineRadar/.env): Yerel ortam değişkenleri.
- [.env.example](file:///c:/MyApps/MarineRadar/.env.example): Ortam değişkenleri şablonu.
- [src/config/db.js](file:///c:/MyApps/MarineRadar/src/config/db.js): Mongoose veritabanı bağlantı modülü.
- [src/config/swagger.js](file:///c:/MyApps/MarineRadar/src/config/swagger.js): Swagger OpenAPI 3.0 dokümantasyon konfigürasyonu (BearerAuth dahil).
- [src/models/News.js](file:///c:/MyApps/MarineRadar/src/models/News.js): Mongoose `News` şema ve model tanımı (`fullContent`, `matchedVessels`, `regulations`, `complianceRisk`).
- [src/models/Newsletter.js](file:///c:/MyApps/MarineRadar/src/models/Newsletter.js): Mongoose `Newsletter` şema ve ilişkisel model tanımı.
- [src/models/Vessel.js](file:///c:/MyApps/MarineRadar/src/models/Vessel.js): Mongoose `Vessel` (Gemi Filosu) şema ve model tanımı.
- [src/models/User.js](file:///c:/MyApps/MarineRadar/src/models/User.js): Mongoose `User` (Kullanıcı & Filo Atamaları) şema ve model tanımı.
- [src/data/seedFleet.js](file:///c:/MyApps/MarineRadar/src/data/seedFleet.js): A Kullanıcısı (5 Gemi) ve B Kullanıcısı (3 Gemi) filolarını otomatik yükleyen seeder servisi.
- [src/services/rssService.js](file:///c:/MyApps/MarineRadar/src/services/rssService.js): Otomatik RSS akışı kazıma ve analiz servisi.
- [src/services/htmlService.js](file:///c:/MyApps/MarineRadar/src/services/htmlService.js): Axios & Cheerio tabanlı HTML web kazıma servisi.
- [src/services/deepScraperService.js](file:///c:/MyApps/MarineRadar/src/services/deepScraperService.js): Orijinal haber bağlantılarından tam makale metinlerini kazıyan derin web scraping servisi.
- [src/services/vesselMatcherService.js](file:///c:/MyApps/MarineRadar/src/services/vesselMatcherService.js): Haber metinlerinden geçen filoya ait gemileri tespit eden akıllı varlık eşleme motoru.
- [src/services/regulationService.js](file:///c:/MyApps/MarineRadar/src/services/regulationService.js): Derin haber metinlerini denizcilik emisyon regülasyonlarına göre etiketleyen ve uyumluluk risk skoru (Compliance Risk) üreten servis.
- [src/services/geminiService.js](file:///c:/MyApps/MarineRadar/src/services/geminiService.js): Google Gemini AI tabanlı yapılandırılmış haber analitiği, Türkçe emisyon değerlendirme notu (`aiNote`), otomatik kategori seçimi ve gemi tespit servisi.
- [src/services/cronService.js](file:///c:/MyApps/MarineRadar/src/services/cronService.js): Node-cron periyodik arka plan görevleri ve 4 Aşamalı Tam Boru Hattı (`runFullPipeline`) servisi.
- [Dockerfile](file:///c:/MyApps/MarineRadar/Dockerfile): Express REST API Docker imaj tanımı.
- [.dockerignore](file:///c:/MyApps/MarineRadar/.dockerignore): Docker build hariç tutma kuralları.
- [docker-compose.yml](file:///c:/MyApps/MarineRadar/docker-compose.yml): MongoDB ve Hot-Reload destekli API servis orkestrasyonu.
- [src/controllers/newsController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsController.js): MongoDB haber, boru hattı ve kişisel filo akışı iş mantığı katmanı.
- [src/controllers/newsletterController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsletterController.js): Akıllı bülten derleyici katmanı.
- [src/controllers/vesselController.js](file:///c:/MyApps/MarineRadar/src/controllers/vesselController.js): Gemi filosu CRUD iş mantığı katmanı.
- [src/controllers/userController.js](file:///c:/MyApps/MarineRadar/src/controllers/userController.js): Kullanıcı hesabı ve filoya gemi ekleme/çıkarma iş mantığı katmanı.
- [src/controllers/authController.js](file:///c:/MyApps/MarineRadar/src/controllers/authController.js): JWT kullanıcı oturum açma ve kişisel filo kontrol katmanı.
- [src/routes/newsRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsRoutes.js): REST haber ve 4 aşamalı boru hattı rotaları.
- [src/routes/newsletterRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsletterRoutes.js): REST bülten rotaları.
- [src/routes/vesselRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/vesselRoutes.js): REST gemi rotaları.
- [src/routes/userRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/userRoutes.js): REST kullanıcı filosu ve gemi ekleme/çıkarma rotaları (`/:id/vessels`).
- [src/routes/authRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/authRoutes.js): REST JWT kimlik doğrulama rotaları.
- [src/middlewares/authMiddleware.js](file:///c:/MyApps/MarineRadar/src/middlewares/authMiddleware.js): JWT token doğrulama ve kullanıcı filo yetki katmanı.
- [src/middlewares/validateNews.js](file:///c:/MyApps/MarineRadar/src/middlewares/validateNews.js): Doğrulama katmanı.
- [src/middlewares/errorHandler.js](file:///c:/MyApps/MarineRadar/src/middlewares/errorHandler.js): Hata katmanı.
- [public/index.html](file:///c:/MyApps/MarineRadar/public/index.html): MyCarbons kurumsal kimliğine uygun web dashboard semantik HTML5 iskeleti, üst menü kullanıcı modalı ve akıllı sayfalama çubuğu.
- [public/styles.css](file:///c:/MyApps/MarineRadar/public/styles.css): Yaprak yeşili eco-design tasarım sistemi, zümrüt degrade üst menü butonları, modern gemi silme butonları ve sayfalama CSS kuralları.
- [public/app.js](file:///c:/MyApps/MarineRadar/public/app.js): Asenkron REST API istemci mantığı, akıllı sayfa kısaltma motoru (`1 2 3 ... N`), oturum doğrulaması ve canlı haber süzme.
- [index.test.js](file:///c:/MyApps/MarineRadar/index.test.js): 22/22 geçen MongoDB, RSS, HTML, Newsletter, Vessel, User, Auth, Scrape Pipeline, Swagger UI & Dashboard entegrasyon testleri.
