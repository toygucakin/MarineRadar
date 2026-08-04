import { Router } from 'express';
import { getAllNews, getNewsById, createNews, scrapeRssNews } from '../controllers/newsController.js';
import { validateCreateNews } from '../middlewares/validateNews.js';

const router = Router();

/**
 * Route Katmanı (Yönlendirme)
 */

// GET /api/news -> Tüm haberleri getirme
router.get('/', getAllNews);

// POST /api/news/scrape/rss -> Otomatik RSS Akışı Kazıma (Dinamik :id'den ÖNCE tanımlanmalı!)
router.post('/scrape/rss', scrapeRssNews);

// GET /api/news/:id -> ID bazlı haber getirme
router.get('/:id', getNewsById);

// POST /api/news -> Manuel yeni haber ekleme (Önce validateCreateNews middleware'i çalışır)
router.post('/', validateCreateNews, createNews);

export default router;
