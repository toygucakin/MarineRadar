import express from 'express';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';
import { connectDB } from './src/config/db.js';
import { initCronJobs } from './src/services/cronService.js';
import newsRoutes from './src/routes/newsRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

// Express uygulamasını (app) başlatıyoruz
const app = express();

// Sunucunun çalışacağı port (varsayılan: 3000)
const PORT = process.env.PORT || 3000;

// Veritabanı ve Cron Hizmetleri (Test modunda değilsek başlatılır)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  initCronJobs();
}

// Gelen isteklerdeki JSON verilerini otomatik ayrıştırmak için middleware
app.use(express.json());

// Statik Web Dashboard Dosyalarını Sunma (public/index.html)
app.use(express.static('public'));

// Canlı İnteraktif Swagger API Dokümantasyonu (/api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota (Route) Montajları
app.use('/api/news', newsRoutes);
app.use('/api/newsletters', newsletterRoutes);

// 404 Fallback Middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `İstenen endpoint '${req.originalUrl}' bu sunucuda bulunamadı.`
  });
});

// Merkezi Hata Yönetimi Middleware
app.use(errorHandler);

// Otomatik testlerde port çakışmasını önlemek için
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 MyCarbons API Sunucusu http://localhost:${PORT} üzerinde çalışıyor.`);
    console.log(`📖 Canlı Swagger API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
  });
}

// Testler için dışa aktarım
export default app;
