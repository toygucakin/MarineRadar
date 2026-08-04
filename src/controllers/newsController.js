import { News } from '../models/News.js';
import mongoose from 'mongoose';
import { scrapeRssFeeds } from '../services/rssService.js';
import { scrapeHtmlTargets } from '../services/htmlService.js';

/**
 * Controller (MongoDB / Mongoose İş Mantığı Katmanı)
 */

// GET /api/news -> Tüm haberleri veritabanından getirir
export const getAllNews = async (req, res, next) => {
  try {
    const newsList = await News.find().sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      count: newsList.length,
      data: newsList
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/:id -> Tek bir haberi getirir
export const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Mongo ObjectId formatında geçerlilik kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const newsItem = await News.findById(id);

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    res.status(200).json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news -> Yeni gemicilik haberi ekler
export const createNews = async (req, res, next) => {
  try {
    const { title, summary, category, author, impactScore, sourceUrl } = req.body;

    const newNewsItem = await News.create({
      title,
      summary,
      category,
      author: author || 'Anonim Analist',
      impactScore,
      sourceUrl
    });

    res.status(201).json({
      success: true,
      message: 'Yeni gemicilik haberi başarıyla veritabanına eklendi.',
      data: newNewsItem
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/scrape/rss -> RSS Akışlarından otomatik haber kazıma tetikler
export const scrapeRssNews = async (req, res, next) => {
  try {
    const { feeds } = req.body || {};
    const result = await scrapeRssFeeds(feeds);

    res.status(200).json({
      success: true,
      message: `RSS Kazıma İşlemi Tamamlandı: ${result.addedCount} yeni haber veritabanına eklendi, ${result.skippedCount} mevcut haber atlandı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/scrape/html -> HTML Web Sayfalarından otomatik haber kazıma tetikler
export const scrapeHtmlNews = async (req, res, next) => {
  try {
    const { targets } = req.body || {};
    const result = await scrapeHtmlTargets(targets);

    res.status(200).json({
      success: true,
      message: `HTML Kazıma İşlemi Tamamlandı: ${result.addedCount} yeni haber veritabanına eklendi, ${result.skippedCount} mevcut haber atlandı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
