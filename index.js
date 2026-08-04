import express from 'express';
import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import newsRoutes from './src/routes/newsRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

// Express uygulamasını (app) başlatıyoruz
const app = express();

// Sunucunun çalışacağı port (varsayılan: 3000)
const PORT = process.env.PORT || 3000;

// Veritabanı Bağlantısı (Test modunda değilsek başlatılır)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Gelen isteklerdeki JSON verilerini otomatik ayrıştırmak için middleware
app.use(express.json());

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
  });
}

// Testler için dışa aktarım
export default app;
