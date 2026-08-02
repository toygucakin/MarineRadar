import request from 'supertest';
import app from './index.js';

describe('MyCarbons REST API Integration Tests', () => {

  // TEST 1: Tüm haberlerin listelenmesi (GET /api/news)
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

  // TEST 2: Geçerli ID ile tek bir haber getirilmesi (GET /api/news/:id)
  describe('GET /api/news/:id (Geçerli ID)', () => {
    it('var olan bir ID verilince status 200 ve ilgili haber detayını dönmelidir', async () => {
      const response = await request(app).get('/api/news/news-101');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('news-101');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('impactScore');
    });
  });

  // TEST 3: Geçersiz ID ile haber aranması (GET /api/news/:id)
  describe('GET /api/news/:id (Geçersiz ID)', () => {
    it('sistemde olmayan bir ID verilince status 404 ve hata mesajı dönmelidir', async () => {
      const response = await request(app).get('/api/news/news-999');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("news-999");
    });
  });

  // TEST 4: Tanımsız endpoint sorgusu (GET /api/tanimsiz-adres)
  describe('GET /api/unknown-endpoint (Bulunamayan Rota)', () => {
    it('tanımsız bir adrese istek atılınca 404 döner', async () => {
      const response = await request(app).get('/api/tanimsiz-adres');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

});
