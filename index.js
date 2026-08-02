import express from 'express';
import newsRoutes from './src/routes/newsRoutes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

// Express uygulamasını (app) başlatıyoruz
const app = express();

// Sunucunun çalışacağı port (varsayılan: 3000)
const PORT = process.env.PORT || 3000;

// Gelen isteklerdeki JSON verilerini otomatik ayrıştırmak (parse) için middleware ekliyoruz
app.use(express.json());

// Rota (Route) Montajı: '/api/news' ile başlayan tüm istekleri newsRoutes modülüne yönlendiriyoruz
app.use('/api/news', newsRoutes);

// 404 Fallback Middleware: Tanımlanmayan adreslere atılan istekleri yakalar
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `İstenen endpoint '${req.originalUrl}' bu sunucuda bulunamadı.`
  });
});

// Merkezi Hata Yönetimi Middleware (Centralized Error Handler)
app.use(errorHandler);

// Otomatik testlerde port çakışmasını (EADDRINUSE) önlemek için
// sunucuyu sadece test ortamında değilsek dinlemeye alıyoruz.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 MyCarbons API Sunucusu http://localhost:${PORT} üzerinde çalışıyor.`);
  });
}

// Test dosyalarında (index.test.js) Supertest ile kullanabilmek için app nesnesini dışa aktarıyoruz
export default app;
