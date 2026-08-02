# MyCarbons (MarineRadar) - Backend & Test Mühendisliği Yol Haritası

## 🚢 Proje Vizyonu ve Kapsamı
**MyCarbons / MarineRadar**, gemicilik ve deniz taşımacılığı sektörüne yönelik karbon emisyonu takibi, denizcilik haberleri ve veri analitiği sağlayan modern bir RESTful API platformudur.

Senior Backend Developer ve Test Mühendisi perspektifinden hedefimiz; temiz, sürdürülebilir, test edilebilir ve ölçeklenebilir bir mimari kurmaktır.

---

## 🗺️ Sıfırdan İlerleme Yol Haritası (Learning Roadmap)

### Aşama 1: Temel Mimarinin Kurulması (TAMAMLANDI ✅)
- ES Modules (`"type": "module"`) standartlarında ilk API iskeleti.
- Jest & Supertest ilk entegrasyon testi.
- Postman ile manuel doğrulama.

### Aşama 2: API'yi Genişletme ve Katmanlı Mimari (TAMAMLANDI ✅)
1. **Katmanlı Mimari (MVC Pattern / Separation of Concerns):**
   - **Data Layer:** `src/data/mockNews.js` ile tip güvenli mock haber verileri.
   - **Controller Layer:** `src/controllers/newsController.js` ile iş mantığı (`getAllNews`, `getNewsById`).
   - **Route Layer:** `src/routes/newsRoutes.js` ile URL haritalaması (`/` ve `/:id`).

2. **Dinamik Endpointler & Hata Yönetimi:**
   - `GET /api/news`: Tüm haberlerin listesini döner (`200 OK`).
   - `GET /api/news/:id`: Belirli bir haberi getirir (`200 OK` veya `404 Not Found`).
   - Merkezi 404 Middleware entegrasyonu.

3. **Gelişmiş Jest & Supertest Otomatik Testleri:**
   - 4 ayrı test senaryosu yazıldı ve başarıyla doğrulandı (`4/4 PASS`).

---

### Aşama 3: Veritabanı ve Gelişmiş Test Mühendisliği (Gelecek Adım - Onay Bekliyor ⏳)
- **Validation (Giriş Doğrulama):** Zod veya Joi ile istek parametrelerinin ve body doğrulaması.
- **Veritabanı Entegrasyonu:** PostgreSQL / MongoDB entegrasyonu hazırlığı ve ORM kullanımı.
- **Gelişmiş Mocking & CI/CD:** GitHub Actions ile otomatik test süreçleri.

---

## 🛠️ Tamamlanan Proje Dosyaları
- [package.json](file:///c:/MyApps/MarineRadar/package.json): Paketler ve test betikleri.
- [index.js](file:///c:/MyApps/MarineRadar/index.js): Express uygulaması ve route montajı.
- [src/data/mockNews.js](file:///c:/MyApps/MarineRadar/src/data/mockNews.js): Mock veri katmanı.
- [src/controllers/newsController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsController.js): İş mantığı katmanı.
- [src/routes/newsRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsRoutes.js): Rota yönetimi katmanı.
- [index.test.js](file:///c:/MyApps/MarineRadar/index.test.js): 4 senaryolu entegrasyon testi.
