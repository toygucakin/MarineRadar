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
            fullContent: { type: 'string', example: 'IMO has officially announced new decarbonization guidelines...' },
            isFullyScraped: { type: 'boolean', example: true },
            scrapedAt: { type: 'string', format: 'date-time' },
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
        },
        Vessel: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66c2d1a5f123456789abcdef' },
            vesselName: { type: 'string', example: 'Thamesborg' },
            imoNumber: { type: 'string', example: '9546461' },
            mmsi: { type: 'string', example: '244750431' },
            callSign: { type: 'string', example: 'PBFZ' },
            flag: { type: 'string', example: 'Netherlands' },
            vesselType: { type: 'string', example: 'General Cargo' },
            grossTonnage: { type: 'number', example: 11864 },
            ownerCompany: { type: 'string', example: 'Wagenborg Shipping' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66c2e3b8a987654321fedcba' },
            name: { type: 'string', example: 'Ahmet Armatör (A Kullanıcısı)' },
            email: { type: 'string', example: 'ahmet.armator@mycarbons.com' },
            role: { type: 'string', example: 'armator' },
            assignedVessels: {
              type: 'array',
              items: { $ref: '#/components/schemas/Vessel' }
            }
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
      '/api/news/{id}/scrape-deep': {
        post: {
          summary: 'Belirli bir haber için kaynak bağlantıdan tam makale metnini kazır',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Derin metin kazıma başarılı ve veritabanı güncellendi' }
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
      '/api/news/scrape/deep': {
        post: {
          summary: 'İçeriği eksik olan tüm haberlerin makale metinlerini toplu olarak kazır',
          responses: {
            200: { description: 'Toplu derin kazıma raporu' }
          }
        }
      },
      '/api/news/match-vessels': {
        post: {
          summary: 'Veritabanındaki haberlerde gemi ismi veya IMO numarasına göre toplu varlık eşlemesi çalıştırır',
          responses: {
            200: { description: 'Toplu gemi varlık eşleme raporu' }
          }
        }
      },
      '/api/news/{id}/match-vessels': {
        post: {
          summary: 'Belirli bir haber metninde geçen filoya ait gemileri tespit eder ve habere kaydeder',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Gemi eşleme tamamlandı' }
          }
        }
      },
      '/api/news/vessel/{vesselId}': {
        get: {
          summary: 'Belirli bir gemiyle (IMO/Adı) eşleşmiş olan tüm haberleri getirir',
          parameters: [
            { name: 'vesselId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Gemi odaklı haber listesi' }
          }
        }
      },
      '/api/news/classify-regulations': {
        post: {
          summary: 'Veritabanındaki haberlerde denizcilik regülasyon analizi ve uyumluluk risk skorlaması çalıştırır',
          responses: {
            200: { description: 'Toplu regülasyon sınıflandırma raporu' }
          }
        }
      },
      '/api/news/{id}/classify-regulations': {
        post: {
          summary: 'Belirli bir haber için IMO DCS, EU ETS, FuelEU Maritime, CII/EEXI regülasyon analizi yapar',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Regülasyon analitiği tamamlandı' }
          }
        }
      },
      '/api/news/regulation/{code}': {
        get: {
          summary: 'Belirli bir regülasyon koduyla (EU_ETS, CII_EEXI, IMO_DCS vb.) etiketlenmiş haberleri getirir',
          parameters: [
            { name: 'code', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Regülasyona özel haber listesi' }
          }
        }
      },
      '/api/vessels': {
        get: {
          summary: 'Tüm gemi filosunu listeler',
          responses: {
            200: { description: 'Gemi filosu listesi' }
          }
        },
        post: {
          summary: 'Yeni gemi ekler',
          responses: {
            201: { description: 'Gemi başarıyla eklendi' }
          }
        }
      },
      '/api/vessels/{id}': {
        get: {
          summary: 'ID bazlı gemi detayını getirir',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Gemi detayları' },
            404: { description: 'Gemi bulunamadı' }
          }
        }
      },
      '/api/users': {
        get: {
          summary: 'Tüm kullanıcıları atanmış gemi filoları ile listeler',
          responses: {
            200: { description: 'Kullanıcılar ve gemi atamaları' }
          }
        },
        post: {
          summary: 'Yeni kullanıcı hesabı ve gemi yetki ataması ekler',
          responses: {
            201: { description: 'Kullanıcı oluşturuldu' }
          }
        }
      },
      '/api/users/seed': {
        post: {
          summary: 'A Kullanıcısı (5 Gemi) ve B Kullanıcısı (3 Gemi) örnek verilerini veritabanına yükler',
          responses: {
            200: { description: 'Örnek filolar başarıyla yüklendi' }
          }
        }
      },
      '/api/users/{id}': {
        get: {
          summary: 'ID bazlı kullanıcı hesabını ve atanmış gemilerini getirir',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Kullanıcı detayı ve gemileri' },
            404: { description: 'Kullanıcı bulunamadı' }
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
