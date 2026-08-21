import { Router } from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  scrapeRssNews,
  scrapeHtmlNews,
  scrapeDeepNewsById,
  scrapeDeepAllNews
} from '../controllers/newsController.js';
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

// POST /api/news/scrape/deep -> İçeriği eksik haberleri toplu olarak detaylı kazıma
router.post('/scrape/deep', scrapeDeepAllNews);

// GET /api/news/:id -> ID bazlı haber getirme
router.get('/:id', getNewsById);

// POST /api/news/:id/scrape-deep -> Tek haber için detaylı metin kazıma
router.post('/:id/scrape-deep', scrapeDeepNewsById);

// POST /api/news -> Manuel yeni haber ekleme (Önce validateCreateNews middleware'i çalışır)
router.post('/', validateCreateNews, createNews);

export default router;

