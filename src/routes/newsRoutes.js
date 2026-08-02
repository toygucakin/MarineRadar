import { Router } from 'express';
import { getAllNews, getNewsById, createNews } from '../controllers/newsController.js';
import { validateCreateNews } from '../middlewares/validateNews.js';

const router = Router();

/**
 * Route Katmanı (Yönlendirme)
 */

// GET /api/news -> Tüm haberleri getirme
router.get('/', getAllNews);

// GET /api/news/:id -> ID bazlı haber getirme
router.get('/:id', getNewsById);

// POST /api/news -> Yeni haber ekleme (Önce validateCreateNews middleware'i çalışır)
router.post('/', validateCreateNews, createNews);

export default router;
