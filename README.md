# MarineRadar-Backend ⚓🤖

**MyCarbons (MarineRadar)** - Otomatik Gemicilik Bülten & Karbon Analiz Platformu REST API ve Google Gemini AI Boru Hattı Servisi.

> [!NOTE]
> Bu repozituvar, projenin **Backend REST API** servisini içermektedir. Bağımsız Frontend repozituvarı için [MarineRadar-Frontend](https://github.com/toygucakin/MarineRadar-Frontend) deposunu ziyaret edebilirsiniz.

---

## 🌟 Temel Özellikler & İşlevler

1. **5 Aşamalı Akıllı Veri Boru Hattı (5-Stage AI Scraping Pipeline):**
   - **Stage 1 (RSS & HTML Ingestion):** Maritime haber kaynaklarından otomatik veri toplama.
   - **Stage 2 (Deep Article Scraper):** Orijinal haber bağlantılarından tam makale metinlerini kazıma.
   - **Stage 3 (Vessel Entity Matcher):** Haber metinlerinden filodaki gemi isimlerini tespit etme.
   - **Stage 4 (Regulation Classifier):** EU ETS, IMO DCS, EU MRV, FuelEU etiketlemesi ve Uyum Risk Skoru hesabı.
   - **Stage 5 (Google Gemini AI Engine):** Gemini Flash AI ile İngilizce karbonsuzlaşma yorumu ve etki analizi üretimi.
2. **Kullanıcı Yetkilendirme & Kişisel Filo Yönetimi (User Auth & Fleet):**
   - JWT token doğrulama, kullanıcıya özel filo gemisi atama ve `/api/news/my-vessels` korumalı haber akışı.
3. **Özel Bülten Derleyici (Newsletter Generator):**
   - Karbon ve alternatif yakıt haberlerinden yüksek etki puanlı günlük/haftalık bülten derleme.
4. **Swagger UI İnteraktif Dokümantasyon:**
   - `/api-docs` adresi üzerinden canlı API test platformu.
5. **CORS & Esnek İstemci Desteği:**
   - `cors` middleware ile `MarineRadar-Frontend` (`http://localhost:4000`) çapraz alan erişim desteği.

---

## 🚀 Kurulum ve Çalıştırma (Installation & Running)

### 1. Yerel Ortam Değişkenleri (`.env`)
`.env.example` dosyasını kopyalayarak `.env` oluşturun:
```bash
cp .env.example .env
```
`.env` dosyasındaki `GEMINI_API_KEY`, `MONGO_URI` ve `CORS_ORIGIN` değişkenlerini ayarlayın:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/marineradar
NODE_ENV=development
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
CORS_ORIGIN=http://localhost:4000,http://localhost:3000
SERVE_STATIC=true
```

### 2. Bağımlılıkların Kurulumu
```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Sunucu varsayılan olarak `http://localhost:3000` adresinde başlayacaktır.
- **Swagger API Docs:** `http://localhost:3000/api-docs`

### 4. Entegrasyon Testlerini Çalıştırma
```bash
npm test
```
Tüm 24 Jest & Supertest entegrasyon testi çalıştırılacaktır.

---

## 🐳 Docker & Docker Compose ile Çalıştırma

```bash
docker-compose up --build
```
Bu komut hem MongoDB hem de Node.js Express API servisini orkestre ederek çalıştırır.

---

## 🔗 İlgili Repozituvarlar

- 🟢 **Frontend Repo:** [MarineRadar-Frontend](https://github.com/toygucakin/MarineRadar-Frontend)
- 🔵 **Backend Repo:** [MarineRadar-Backend](https://github.com/toygucakin/MarineRadar-Backend)
