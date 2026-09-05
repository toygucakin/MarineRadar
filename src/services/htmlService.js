import axios from 'axios';
import * as cheerio from 'cheerio';
import { News } from '../models/News.js';
import { analyzeContent } from './rssService.js';
import { scrapeArticleContent } from './deepScraperService.js';
import { matchVesselsForNewsItem } from './vesselMatcherService.js';
import { classifyRegulationsForNewsItem } from './regulationService.js';
import { analyzeNewsWithGemini } from './geminiService.js';

// HTML Kazıma için varsayılan denizcilik portal adresleri
const DEFAULT_HTML_TARGETS = [
  {
    name: 'Safety4Sea',
    url: 'https://safety4sea.com/',
    selectors: {
      container: '.td_module_wrap, article',
      title: 'h3.entry-title a, h2.entry-title a',
      summary: '.td-excerpt, .entry-summary, p'
    }
  }
];

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  },
  timeout: 15000
};

/**
 * Axios ve Cheerio ile HTML Web Sayfalarını Kazıyan ve MongoDB'ye Kaydeden Servis
 */
export const scrapeHtmlTargets = async (customTargets = null) => {
  const targetsToScrape = customTargets || DEFAULT_HTML_TARGETS;
  let addedCount = 0;
  let skippedCount = 0;
  const errors = [];
  const addedNews = [];

  for (const target of targetsToScrape) {
    const targetUrl = typeof target === 'string' ? target : target.url;
    const selectors = typeof target === 'object' && target.selectors ? target.selectors : {
      container: 'article, .post, .news-item, .card',
      title: 'h2 a, h3 a, h1 a, .title a, a.headline',
      summary: 'p, .summary, .excerpt, .description'
    };

    try {
      const response = await axios.get(targetUrl, AXIOS_CONFIG);
      const $ = cheerio.load(response.data);

      const containers = $(selectors.container);

      for (let i = 0; i < containers.length; i++) {
        const el = containers.eq(i);
        const titleEl = el.find(selectors.title).first();
        const rawTitle = titleEl.text() ? titleEl.text().trim() : '';
        const rawLink = titleEl.attr('href') ? titleEl.attr('href').trim() : '';
        const rawSummary = el.find(selectors.summary).first().text() ? el.find(selectors.summary).first().text().trim() : rawTitle;

        if (!rawTitle || rawTitle.length < 3 || !rawLink) {
          continue;
        }

        // Göreli (relative) URL'leri mutlak (absolute) URL'ye çevir
        let sourceUrl = rawLink;
        try {
          sourceUrl = new URL(rawLink, targetUrl).href;
        } catch (e) {
          // url hatası alırsa ham linki korur
        }

        const summary = rawSummary.substring(0, 300);

        // Çift Kayıt Engelleme (Deduplication)
        const existingNews = await News.findOne({
          $or: [
            { sourceUrl: sourceUrl },
            { title: rawTitle }
          ]
        });

        if (existingNews) {
          skippedCount++;
          continue;
        }

        // Kategori ve Etki Puanı Analizi
        const { category, impactScore } = analyzeContent(rawTitle, summary);

        // Otomatik Derin Metin Kazıma (Deep Scraping)
        let fullContent = summary;
        if (sourceUrl && sourceUrl.startsWith('http')) {
          try {
            const deepScraped = await scrapeArticleContent(sourceUrl);
            if (deepScraped && deepScraped.fullContent) {
              fullContent = deepScraped.fullContent;
            }
          } catch (e) {
            // Hata durumunda özeti tam metin olarak fallback yap
          }
        }

        // Veritabanı Kaydı
        const newNews = await News.create({
          title: rawTitle,
          summary,
          category,
          sourceUrl,
          author: target.name || 'HTML Web Scraper Bot',
          impactScore,
          publishedAt: new Date(),
          fullContent,
          isFullyScraped: true,
          scrapedAt: new Date()
        });

        // Gemi Varlık Eşleme, Regülasyon Sınıflandırması & Otomatik Google Gemini AI Analizi
        try {
          await matchVesselsForNewsItem(newNews);
          await classifyRegulationsForNewsItem(newNews);
          if (process.env.GEMINI_API_KEY || process.env.NODE_ENV === 'test') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await analyzeNewsWithGemini(newNews._id || newNews.id);
          }
        } catch (e) {
          console.warn(`⚠️ [HTML Auto-AI] "${newNews.title}" AI analizi uyarısı: ${e.message}`);
        }

        addedNews.push(newNews);
        addedCount++;
      }
    } catch (err) {
      console.error(`❌ HTML Kazıma Hatası (${targetUrl}): ${err.message}`);
      errors.push({ targetUrl, message: err.message });
    }
  }

  return {
    success: true,
    addedCount,
    skippedCount,
    errorCount: errors.length,
    errors,
    data: addedNews
  };
};
