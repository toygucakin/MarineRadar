import request from 'supertest';
import app from './index.js';

describe('MyCarbons REST API Integration Tests (Stage 3)', () => {

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
      const response = await request(app).get('/api/news/news-101');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('news-101');
    });
  });

  // GET /api/news/:id (Geçersiz ID) Testi
  describe('GET /api/news/:id (Geçersiz ID)', () => {
    it('sistemde olmayan bir ID verilince status 404 ve hata mesajı dönmelidir', async () => {
      const response = await request(app).get('/api/news/news-999');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
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

  // POST /api/news (Hatalı Senaryo - 400 Bad Request Validation Error)
  describe('POST /api/news (Eksik/Hatalı Veri - Validation Error)', () => {
    it('eksik alan veya hatalı impactScore gönderilirse 400 Bad Request ve ayrıntılı hata listesi dönmelidir', async () => {
      const invalidPayload = {
        title: 'Kısa', // En az 3 karakter olmalı ama summary ve impactScore eksik
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
