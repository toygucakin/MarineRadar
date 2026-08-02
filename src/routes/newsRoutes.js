import { Router } from 'express';
import { getAllNews, getNewsById } from '../controllers/newsController.js';

// Express Router modülünü başlatıyoruz
const router = Router();

/**
 * Route Katmanı (Yönlendirme)
 * Hangi URL ve HTTP metodunun hangi Controller fonksiyonunu tetikleyeceğini haritalar.
 */

// GET /api/news -> Tüm haberleri getirir
router.get('/', getAllNews);

// GET /api/news/:id -> ID parametresine göre tek bir haber getirir (Ör: /api/news/news-101)
router.get('/:id', getNewsById);

export default router;
