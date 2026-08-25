import { Router } from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  scrapeRssNews,
  scrapeHtmlNews,
  scrapeDeepNewsById,
  scrapeDeepAllNews,
  matchVesselsSingleNews,
  matchVesselsAllNews,
  getNewsByVesselId,
  getMyVesselsNews,
  classifyRegulationsSingleNews,
  classifyRegulationsAllNews,
  getNewsByRegulationCode,
  runScrapingPipelineController,
  analyzeNewsWithGeminiController,
  analyzeBatchNewsWithGeminiController
} from '../controllers/newsController.js';
import { validateCreateNews } from '../middlewares/validateNews.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * Route Katmanı (Yönlendirme)
 */

// GET /api/news -> Tüm haberleri getirme
router.get('/', getAllNews);

// GET /api/news/my-vessels -> Giriş yapan kullanıcının kendi gemilerine özel haber akışını getirme (Korumalı)
router.get('/my-vessels', verifyToken, getMyVesselsNews);

// GET /api/news/vessel/:vesselId -> Belirli bir gemiyle eşleşen haberleri getirme
router.get('/vessel/:vesselId', getNewsByVesselId);

// GET /api/news/regulation/:code -> Belirli bir regülasyon koduyla (EU_ETS, CII_EEXI vb.) eşleşen haberleri getirme
router.get('/regulation/:code', getNewsByRegulationCode);

// POST /api/news/scrape/pipeline -> 4 Aşamalı Tam Otomatik Veri Boru Hattı (Ingest ➔ Deep Scrape ➔ Vessel Match ➔ Regulation Tagging)
router.post('/scrape/pipeline', runScrapingPipelineController);

// POST /api/news/scrape/rss -> Otomatik RSS Akışı Kazıma
router.post('/scrape/rss', scrapeRssNews);

// POST /api/news/scrape/html -> Otomatik HTML Sayfa Kazıma
router.post('/scrape/html', scrapeHtmlNews);

// POST /api/news/scrape/deep -> İçeriği eksik haberleri toplu olarak detaylı kazıma
router.post('/scrape/deep', scrapeDeepAllNews);

// POST /api/news/match-vessels -> Veritabanındaki haberlerde toplu gemi tespiti çalıştırma
router.post('/match-vessels', matchVesselsAllNews);

// POST /api/news/classify-regulations -> Veritabanındaki haberlerde toplu regülasyon analitiği çalıştırma
router.post('/classify-regulations', classifyRegulationsAllNews);

// POST /api/news/ai-analyze -> Veritabanındaki işlenmemiş haberlere toplu Google Gemini AI analizi uygulama
router.post('/ai-analyze', analyzeBatchNewsWithGeminiController);

// GET /api/news/:id -> ID bazlı haber getirme
router.get('/:id', getNewsById);

// POST /api/news/:id/scrape-deep -> Tek haber için detaylı metin kazıma
router.post('/:id/scrape-deep', scrapeDeepNewsById);

// POST /api/news/:id/match-vessels -> Tek haber için gemi varlık eşleme çalıştırma
router.post('/:id/match-vessels', matchVesselsSingleNews);

// POST /api/news/:id/classify-regulations -> Tek haber için regülasyon sınıflandırması çalıştırma
router.post('/:id/classify-regulations', classifyRegulationsSingleNews);

// POST /api/news/:id/ai-analyze -> Tek haber için anlık Google Gemini AI analizi çalıştırma
router.post('/:id/ai-analyze', analyzeNewsWithGeminiController);

// POST /api/news -> Manuel yeni haber ekleme (Önce validateCreateNews middleware'i çalışır)
router.post('/', validateCreateNews, createNews);

export default router;

