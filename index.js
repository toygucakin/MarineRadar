import express from 'express';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';
import { connectDB } from './src/config/db.js';
import { initCronJobs } from './src/services/cronService.js';
import newsRoutes from './src/routes/newsRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import vesselRoutes from './src/routes/vesselRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { seedFleetData } from './src/data/seedFleet.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

// Express uygulamasını (app) başlatıyoruz
const app = express();

// Sunucunun çalışacağı port (varsayılan: 3000)
const PORT = process.env.PORT || 3000;

// Veritabanı ve Cron Hizmetleri (Test modunda değilsek başlatılır)
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    try {
      await seedFleetData();
    } catch (e) {
      console.warn('Otomatik filo seed uyarısı:', e.message);
    }
  });
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
app.use('/api/vessels', vesselRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

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
  const startServer = (portToUse) => {
    const numericPort = parseInt(portToUse, 10);
    const server = app.listen(numericPort, () => {
      console.log(`🚀 MyCarbons API Sunucusu http://localhost:${numericPort} üzerinde çalışıyor.`);
      console.log(`📖 Canlı Swagger API Dokümantasyonu: http://localhost:${numericPort}/api-docs`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${numericPort} dolu (Docker/WSL kullanımda olabilir), Port ${numericPort + 1} deneniyor...`);
        startServer(numericPort + 1);
      } else {
        console.error('Sunucu başlatma hatası:', err);
      }
    });
  };

  startServer(PORT);
}

// Testler için dışa aktarım
export default app;
