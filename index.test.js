import request from 'supertest';
import mongoose from 'mongoose';
import app from './index.js';
import { News } from './src/models/News.js';
import { Newsletter } from './src/models/Newsletter.js';

describe('MyCarbons REST API Integration Tests (Aşama 10 - Swagger & Cron Katmanı)', () => {
  let createdNewsId;

  beforeAll(async () => {
    const mongoUri = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/marineradar_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    await News.deleteMany({});
    await Newsletter.deleteMany({});

    const sampleNews = await News.create({
      title: 'Yeni IMO Karbon Düzenlemeleri ve Yeşil Liman Girişimleri',
      summary: 'Uluslararası Denizcilik Örgütü (IMO), deniz taşımacılığında karbon ayak izini azaltacak standartları açıkladı.',
      category: 'Clean Energy',
      author: 'MarineRadar Analiz Ekibi',
      impactScore: 8.5
    });

    createdNewsId = sampleNews._id.toString();
  });

  afterAll(async () => {
    await News.deleteMany({});
    await Newsletter.deleteMany({});
    await mongoose.connection.close();
  });

  // GET /api/news Testi
  describe('GET /api/news', () => {
    it('başarılı bir şekilde status code 200 ve tüm haberlerin listesini dönmelidir', async () => {
      const response = await request(app).get('/api/news');

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // GET /api/news/:id (Geçerli ID) Testi
  describe('GET /api/news/:id (Geçerli ID)', () => {
    it('var olan bir ID verilince status 200 ve ilgili haber detayını dönmelidir', async () => {
      const response = await request(app).get(`/api/news/${createdNewsId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdNewsId);
    });
  });

  // POST /api/news (Başarılı Senaryo - 201 Created)
  describe('POST /api/news (Geçerli Veri Ekleme)', () => {
    it('doğru veriler gönderildiğinde 201 Created ve oluşturulan yeni haberi dönmelidir', async () => {
      const newPayload = {
        title: 'LNG Yakıtlı Yeni Dökme Yük Gemisi Göreve Başladı',
        summary: 'Sıvılaştırılmış doğalgaz ile çalışan 180,000 DWT kapasiteli gemi Pasifik rotasında sefere çıktı.',
        category: 'Clean Energy',
        author: 'Test Mühendisi',
        impactScore: 8.9
      };

      const response = await request(app)
        .post('/api/news')
        .send(newPayload);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(newPayload.title);
      expect(response.body.data.impactScore).toBe(8.9);
    });
  });

  // POST /api/newsletters/generate (Akıllı Bülten Oluşturma Testi)
  describe('POST /api/newsletters/generate (Özel Bülten Üretme)', () => {
    it('otomatik bülten üretilmeli, 201 Created ve zenginleştirilmiş haber referansları (populate) dönmelidir', async () => {
      const response = await request(app)
        .post('/api/newsletters/generate')
        .send({ minImpactScore: 7.0, limit: 3 });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(Array.isArray(response.body.data.featuredNews)).toBe(true);
      expect(response.body.data.featuredNews.length).toBeGreaterThan(0);
      expect(response.body.data.featuredNews[0]).toHaveProperty('title');
    });
  });

  // GET /api/newsletters (Arşiv Listeleme Testi)
  describe('GET /api/newsletters (Bülten Arşivi Listeleme)', () => {
    it('oluşturulan bültenler 200 OK ve liste halinde dönmelidir', async () => {
      const response = await request(app).get('/api/newsletters');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // GET / (Web Dashboard Statik Arayüz Testi)
  describe('GET / (Web Dashboard Statik Arayüzü)', () => {
    it('ana sayfaya istek atılınca status 200 ve index.html içeriği dönmelidir', async () => {
      const response = await request(app).get('/');

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('statik /app.js istemci betiği isteğine status 200 ve javascript içeriği dönmelidir', async () => {
      const response = await request(app).get('/app.js');

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/javascript/);
    });

    it('statik /styles.css tasarım dosyası isteğine status 200 ve css içeriği dönmelidir', async () => {
      const response = await request(app).get('/styles.css');

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/css/);
    });
  });

  // POST /api/news/scrape/deep (Toplu Derin Kazıma Testi)
  describe('POST /api/news/scrape/deep (Toplu Derin Kazıma)', () => {
    it('içeriği eksik haberleri tarayıp 200 OK ve kazıma raporu dönmelidir', async () => {
      const response = await request(app)
        .post('/api/news/scrape/deep')
        .send({ limit: 2 });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('scrapedCount');
      expect(response.body.data).toHaveProperty('failedCount');
    });
  });

  // POST /api/users/seed (Aşama 28 - Örnek Gemi ve Kullanıcı Filoları Seeder Testi)
  describe('POST /api/users/seed (Aşama 28 - Filo Seeder)', () => {
    it('A kullanıcısı (5 gemi) ve B kullanıcısı (3 gemi) veritabanına 200 OK ile yüklenmelidir', async () => {
      const response = await request(app).post('/api/users/seed');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data.users.length).toBe(2);
      expect(response.body.data.users[0].vesselCount).toBe(5);
      expect(response.body.data.users[1].vesselCount).toBe(3);
    });
  });

  // GET /api/vessels (Gemi Listeleme Testi)
  describe('GET /api/vessels (Filo Listesi)', () => {
    it('tüm gemi filosu 200 OK ve dizi olarak dönmelidir', async () => {
      const response = await request(app).get('/api/vessels');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('imoNumber');
    });
  });

  // GET /api/users (Kullanıcılar ve Gemi Atamaları Testi)
  describe('GET /api/users (Kullanıcılar ve Atanmış Gemiler)', () => {
    it('kullanıcılar ilişkisel gemi verileri (populate) ile birlikte 200 OK olarak dönmelidir', async () => {
      const response = await request(app).get('/api/users');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data[0].assignedVessels)).toBe(true);
    });
  });

  // POST /api/news/match-vessels (Aşama 29 - Akıllı Çoklu Gemi Varlık Eşleme Testi)
  describe('POST /api/news/match-vessels (Aşama 29 - Gemi Varlık Eşleme)', () => {
    it('veritabanındaki haberlerde geçen gemileri 200 OK ile eşlemelidir', async () => {
      const response = await request(app).post('/api/news/match-vessels');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('updatedNewsCount');
      expect(response.body.data).toHaveProperty('totalMatchesCount');
    });
  });

  // GET /api/news/vessel/:vesselId (Aşama 29 - Gemi Odaklı Haber Filtreleme Testi)
  describe('GET /api/news/vessel/:vesselId (Gemiye Özel Haberler)', () => {
    it('geçerli bir gemi ID verildiğinde 200 OK ve haber listesini dönmelidir', async () => {
      const vesselsRes = await request(app).get('/api/vessels');
      const vesselId = vesselsRes.body.data[0].id;

      const response = await request(app).get(`/api/news/vessel/${vesselId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // POST /api/news/classify-regulations (Aşama 30 - Regülasyon ve Emisyon Analitiği Testi)
  describe('POST /api/news/classify-regulations (Aşama 30 - Regülasyon Analitiği)', () => {
    it('veritabanındaki haberleri regülasyonlara göre etiketleyip risk skorlarını 200 OK ile dönmelidir', async () => {
      const response = await request(app).post('/api/news/classify-regulations');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('classifiedNewsCount');
      expect(response.body.data).toHaveProperty('totalRegulationsCount');
    });
  });

  // GET /api/news/regulation/:code (Aşama 30 - Regülasyona Özel Haber Filtreleme Testi)
  describe('GET /api/news/regulation/:code (Regülasyon Kodlu Haberler)', () => {
    it('geçerli bir regülasyon kodu verilince 200 OK ve filtrelenmiş haber listesini dönmelidir', async () => {
      const response = await request(app).get('/api/news/regulation/EU_ETS');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // POST /api/auth/login & GET /api/news/my-vessels (Aşama 31 - JWT Kimlik Doğrulama & Kişisel Filo Haberleri Testi)
  describe('POST /api/auth/login & GET /api/news/my-vessels (Aşama 31 - Auth & Kişisel Akış)', () => {
    it('geçerli e-posta ile giriş yapılınca JWT token dönmeli ve token ile kişisel filo haberleri 200 OK ile çekilmelidir', async () => {
      // 1. Filo seeder'ı çalıştır
      await request(app).post('/api/users/seed');

      // 2. A Kullanıcısı (ahmet.armator@mycarbons.com) ile giriş yap
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ahmet.armator@mycarbons.com', password: 'password123' });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body).toHaveProperty('token');

      const token = loginRes.body.token;

      // 3. JWT Token kullanarak kişisel haber akışını çek (GET /api/news/my-vessels)
      const myNewsRes = await request(app)
        .get('/api/news/my-vessels')
        .set('Authorization', `Bearer ${token}`);

      expect(myNewsRes.statusCode).toBe(200);
      expect(myNewsRes.body.success).toBe(true);
      expect(myNewsRes.body).toHaveProperty('user');
      expect(Array.isArray(myNewsRes.body.data)).toBe(true);
    });

    it('tokensız korumalı istek atılınca 401 Unauthorized dönmelidir', async () => {
      const response = await request(app).get('/api/news/my-vessels');

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // POST /api/news/scrape/pipeline (Aşama 33 - 4 Aşamalı Tam Boru Hattı Testi)
  describe('POST /api/news/scrape/pipeline (Aşama 33 - Full Pipeline)', () => {
    it('4 aşamalı veri boru hattını çalıştırıp 200 OK ve detaylı aşama raporunu dönmelidir', async () => {
      const response = await request(app).post('/api/news/scrape/pipeline');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('rssAdded');
      expect(response.body.data).toHaveProperty('deepScrapedCount');
      expect(response.body.data).toHaveProperty('matchedVesselsCount');
      expect(response.body.data).toHaveProperty('classifiedRegulationsCount');
    }, 60000);
  });

  // POST /api/news/ai-analyze & POST /api/news/:id/ai-analyze (Aşama 41 - Gemini AI Endpoints)
  describe('POST /api/news/ai-analyze (Aşama 41 - Gemini AI Endpoints)', () => {
    it('toplu AI analizi isteğine 200 OK dönmelidir', async () => {
      const response = await request(app).post('/api/news/ai-analyze?limit=1');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analyzedCount');
    }, 60000);

    it('geçersiz ID ile AI analizi isteğinde 400 Bad Request dönmelidir', async () => {
      const response = await request(app).post('/api/news/invalid-mongo-id/ai-analyze');

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // GET /api-docs (Swagger UI Dokümantasyon Testi)
  describe('GET /api-docs (Swagger UI Dokümantasyonu)', () => {
    it('Swagger UI arayüzü isteğine 200 veya 301/302 yönlendirmesi dönmelidir', async () => {
      const response = await request(app).get('/api-docs/');

      expect([200, 301, 302]).toContain(response.statusCode);
    });
  });

  // POST /api/news (Hatalı Senaryo - 400 Bad Request Validation Error)
  describe('POST /api/news (Eksik/Hatalı Veri - Validation Error)', () => {
    it('eksik alan veya hatalı impactScore gönderilirse 400 Bad Request ve ayrıntılı hata listesi dönmelidir', async () => {
      const invalidPayload = {
        title: 'Kısa',
        summary: 'Küçük'
      };

      const response = await request(app)
        .post('/api/news')
        .send(invalidPayload);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation Error');
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });

  // Tanımsız Rota Testi
  describe('GET /api/unknown-endpoint (Bulunamayan Rota)', () => {
    it('tanımsız bir adrese istek atılınca 404 döner', async () => {
      const response = await request(app).get('/api/tanimsiz-adres');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
