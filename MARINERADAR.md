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

---

### ⏳ Gelecek Aşamalar (Detaylandırılmış Küçük Adımlar)

#### 🔹 Aşama 4: Ortam Değişkenleri (`.env`) ve MongoDB Bağlantı Hazırlığı
- **Kavram:** Neden şifreler, portlar ve DB adresleri koda yazılmaz? (`dotenv` kütüphanesi).
- **Uygulama:** MongoDB Atlas (Bulut veritabanı) veya lokal MongoDB bağlantı dizesinin hazırlanması ve Express içinde `src/config/db.js` ile güvenli DB bağlantısının kurulması.

#### 🔹 Aşama 5: Mongoose ODM & `News` Veri Şeması (Schema & Model)
- **Kavram:** ORM/ODM (Object Data Modeling) nedir? Mongoose neden kullanılır?
- **Uygulama:** `src/models/News.js` şemasının oluşturulması (Title, Summary, SourceUrl, Category, ImpactScore, PublishedAt) ve veri tipi/zorunluluk doğrulamalarının Mongoose seviyesinde yapılması.

#### 🔹 Aşama 6: Controller Katmanını Gerçek MongoDB Operasyonlarına (CRUD) Geçirme
- **Kavram:** `async / await` ile asenkron veritabanı sorguları yönetimi.
- **Uygulama:** Bellekteki `mockNews` dizisini kaldırıp `News.find()`, `News.findById()` ve `News.create()` gibi gerçek veritabanı sorgularına geçiş.
- **Test:** Jest & Supertest testlerimizin MongoDB mimarisine göre güncellenmesi.

#### 🔹 Aşama 7: Web Scraping Temelleri & RSS Feed Parser (İlk Otomatik Veri Kazıma)
- **Kavram:** Web Scraping nedir? RSS Feed mantığı nasıl çalışır?
- **Uygulama:** `rss-parser` kütüphanesi ile IMO ve Maritime Executive RSS akışlarından otomatik haber başlığı ve linklerinin çekilmesi, veritabanına otomatik kaydedilmesi.

#### 🔹 Aşama 8: Advanced HTML Scraping (Axios & Cheerio ile HTML Kazıma)
- **Kavram:** HTML etiketlerinden (DOM/CSS Selectors) veri süzme.
- **Uygulama:** `axios` ve `cheerio` kullanarak RSS akışı olmayan gemicilik haber sitelerinin sayfalarını indirme, haber metinlerini ayıklama ve **Deduplication** (Aynı haberin tekrar eklenmesini önleme) algoritması.

#### 🔹 Aşama 9: Akıllı Bülten Derleyici Modülü (Automated Newsletter Generator)
- **Kavram:** İlişkili veri şemaları (Referencing & Populate).
- **Uygulama:** `src/models/Newsletter.js` şemasının yazılması. Veritabanındaki haberlerden etki puanına (`impactScore`) göre en önemli haberleri seçip otomatik **MyCarbons Özel Bülteni** üreten `POST /api/newsletters/generate` endpoint'inin yazılması.

#### 🔹 Aşama 10: Zamanlanmış Görevler (Cron Jobs) & Canlı API Dokümantasyonu (Swagger)
- **Kavram:** Arka planda periyodik çalışan görevler (Background Jobs).
- **Uygulama:** `node-cron` ile her gece saat 00:00'da otomatik veri kazıma görevinin çalıştırılması.
- **Dokümantasyon:** Swagger UI ile `/api-docs` adresi üzerinden canlı interaktif API dokümantasyonu oluşturulması.

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
