import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Swagger / OpenAPI 3.0 Dokümantasyon Konfigürasyonu
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyCarbons (MarineRadar) REST API',
      version: '1.0.0',
      description: 'Küresel Gemicilik & Karbon Emisyon Bülteni Otomatik Veri Kazıma ve Derleme API Platformu Dokümantasyonu.',
      contact: {
        name: 'MarineRadar Geliştirici Ekibi',
        url: 'https://github.com/toygucakin/MarineRadar'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Yerel / Docker Geliştirme Sunucusu'
      }
    ],
    components: {
      schemas: {
        News: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66b1a2f4e9123456789abcde' },
            title: { type: 'string', example: 'Yeni IMO Karbon Düzenlemeleri ve Yeşil Liman Girişimleri' },
            summary: { type: 'string', example: 'IMO deniz taşımacılığında karbon ayak izini azaltacak standartları açıkladı.' },
            category: { type: 'string', example: 'Carbon Emissions' },
            sourceUrl: { type: 'string', example: 'https://gcaptain.com/news-1' },
            author: { type: 'string', example: 'MarineRadar Analiz Ekibi' },
            impactScore: { type: 'number', example: 8.5 },
            publishedAt: { type: 'string', format: 'date-time' }
          }
        },
        Newsletter: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66b1ab73f9876543210fedcb' },
            title: { type: 'string', example: 'MyCarbons Özel Bülteni (2026-08-04)' },
            summary: { type: 'string', example: 'Bu bülten etki puanı en yüksek 5 haberden derlenmiştir. (Ortalama Etki Puanı: 7.7/10)' },
            topCategory: { type: 'string', example: 'Green Ports' },
            averageImpactScore: { type: 'number', example: 7.7 },
            featuredNews: {
              type: 'array',
              items: { $ref: '#/components/schemas/News' }
            },
            generatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/api/news': {
        get: {
          summary: 'Tüm haberleri veritabanından listeler',
          responses: {
            200: { description: 'Başarılı yanıt' }
          }
        },
        post: {
          summary: 'Manuel yeni gemicilik haberi ekler',
          responses: {
            201: { description: 'Haber başarıyla oluşturuldu' },
            400: { description: 'Doğrulama hatası (Validation Error)' }
          }
        }
      },
      '/api/news/{id}': {
        get: {
          summary: 'ID değerine göre tek haber detayını getirir',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Başarılı yanıt' },
            404: { description: 'Haber bulunamadı' }
          }
        }
      },
      '/api/news/scrape/rss': {
        post: {
          summary: 'Otomatik RSS akışı kazıma işlemini tetikler',
          responses: {
            200: { description: 'RSS Kazıma raporu ve eklenen haberler' }
          }
        }
      },
      '/api/news/scrape/html': {
        post: {
          summary: 'Otomatik HTML web sayfası kazıma işlemini tetikler',
          responses: {
            200: { description: 'HTML Kazıma raporu ve eklenen haberler' }
          }
        }
      },
      '/api/newsletters': {
        get: {
          summary: 'Tüm özel bülten arşivini listeler',
          responses: {
            200: { description: 'Başarılı bülten listesi' }
          }
        }
      },
      '/api/newsletters/generate': {
        post: {
          summary: 'Etki puanı yüksek haberlerden otomatik MyCarbons Özel Bülteni üretir ve arşivler',
          responses: {
            201: { description: 'Bülten başarıyla oluşturuldu' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);
