import { Router } from 'express';
import { getAllNews, getNewsById, createNews, scrapeRssNews, scrapeHtmlNews } from '../controllers/newsController.js';
import { validateCreateNews } from '../middlewares/validateNews.js';

const router = Router();

/**
 * Route Katmanı (Yönlendirme)
 */

// GET /api/news -> Tüm haberleri getirme
router.get('/', getAllNews);

// POST /api/news/scrape/rss -> Otomatik RSS Akışı Kazıma
router.post('/scrape/rss', scrapeRssNews);

// POST /api/news/scrape/html -> Otomatik HTML Sayfa Kazıma
router.post('/scrape/html', scrapeHtmlNews);

// GET /api/news/:id -> ID bazlı haber getirme
router.get('/:id', getNewsById);

// POST /api/news -> Manuel yeni haber ekleme (Önce validateCreateNews middleware'i çalışır)
router.post('/', validateCreateNews, createNews);

export default router;
