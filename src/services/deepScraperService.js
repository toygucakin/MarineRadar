import axios from 'axios';
import * as cheerio from 'cheerio';
import { News } from '../models/News.js';
import { matchVesselsForNewsItem } from './vesselMatcherService.js';
import { classifyRegulationsForNewsItem } from './regulationService.js';

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MarineRadar-DeepScraper/1.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  timeout: 15000
};

// Hedef denizcilik sitelerine özel CSS seçicileri ve gürültü temizleme kuralları
const DOMAIN_SELECTORS = [
  {
    domain: 'gcaptain.com',
    selectors: ['.entry-content p', '.post-content p', 'article p']
  },
  {
    domain: 'splash247.com',
    selectors: ['.entry-content p', '.post-content p', 'article p']
  },
  {
    domain: 'marineinsight.com',
    selectors: ['.single-post-content p', '.entry-content p', 'article p']
  },
  {
    domain: 'safety4sea.com',
    selectors: ['.td-post-content p', '.entry-content p', 'article p']
  },
  {
    domain: 'green4sea.com',
    selectors: ['.td-post-content p', '.entry-content p', 'article p']
  },
  {
    domain: 'maritime-executive.com',
    selectors: ['.article-body p', '.content p', 'article p']
  }
];

const GENERIC_SELECTORS = [
  'article p',
  '.entry-content p',
  '.post-content p',
  '.article-content p',
  '.article-body p',
  'main p'
];

// Temizlenecek gereksiz paragraf kalıpları (Reklam, Telif Hakkı, Sosyal Medya, Bülten Aboneliği)
const NOISE_PATTERNS = [
  /subscribe to/i,
  /follow us on/i,
  /all rights reserved/i,
  /copyright \d{4}/i,
  /sign up for/i,
  /read next:/i,
  /also read:/i,
  /photo credit:/i,
  /share this article/i
];

/**
 * Verilen haber linkinden (sourceUrl) makalenin tüm detaylı içeriğini kazır.
 */
export const scrapeArticleContent = async (sourceUrl) => {
  if (!sourceUrl || typeof sourceUrl !== 'string' || !sourceUrl.startsWith('http')) {
    throw new Error('Geçerli bir haber URL adresi gereklidir.');
  }

  const response = await axios.get(sourceUrl, AXIOS_CONFIG);
  const $ = cheerio.load(response.data);

  // Gereksiz öğeleri DOM'dan kaldır (script, style, iframe, ads, comments)
  $('script, style, iframe, noscript, header, footer, nav, .comments, .sidebar, .related-posts, .advertisement, .ad-box').remove();

  // Domain bazlı seçicileri kontrol et
  let paragraphs = [];
  const matchedDomain = DOMAIN_SELECTORS.find(d => sourceUrl.includes(d.domain));

  if (matchedDomain) {
    for (const selector of matchedDomain.selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          if (text) paragraphs.push(text);
        });
        if (paragraphs.length > 0) break;
      }
    }
  }

  // Domain seçicileri eşleşmediyse veya sonuç dönmediyse jenerik seçicileri dene
  if (paragraphs.length === 0) {
    for (const selector of GENERIC_SELECTORS) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          if (text) paragraphs.push(text);
        });
        if (paragraphs.length > 0) break;
      }
    }
  }

  // Son çare olarak sayfadaki tüm <p> etiketlerini al (karakter uzunluğu > 40)
  if (paragraphs.length === 0) {
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 40) {
        paragraphs.push(text);
      }
    });
  }

  // Paragrafları gürültü filtrelerinden geçir ve temizle
  const cleanedParagraphs = paragraphs.filter(p => {
    if (p.length < 25) return false;
    return !NOISE_PATTERNS.some(pattern => pattern.test(p));
  });

  const fullContent = cleanedParagraphs.join('\n\n');

  if (!fullContent || fullContent.length < 50) {
    throw new Error('Haber sayfasından yeterli metin içeriği kazınamadı.');
  }

  return {
    fullContent,
    paragraphCount: cleanedParagraphs.length,
    characterCount: fullContent.length
  };
};

/**
 * Belirli bir haber ID'si için derin metin kazıması yapar ve MongoDB kaydını günceller.
 */
export const scrapeNewsById = async (newsId) => {
  const newsItem = await News.findById(newsId);
  if (!newsItem) {
    throw new Error('Haber bulunamadı.');
  }

  if (!newsItem.sourceUrl) {
    throw new Error('Habere ait kaynak URL (sourceUrl) bulunmuyor.');
  }

  const result = await scrapeArticleContent(newsItem.sourceUrl);

  newsItem.fullContent = result.fullContent;
  newsItem.isFullyScraped = true;
  newsItem.scrapedAt = new Date();
  await newsItem.save();

  // Otomatik Gemi Varlık Eşleme & Regülasyon Sınıflandırmasını çalıştır
  try {
    await matchVesselsForNewsItem(newsItem);
    await classifyRegulationsForNewsItem(newsItem);
  } catch (e) {
    console.warn(`Derin analiz uyarısı (${newsId}):`, e.message);
  }

  return {
    success: true,
    news: newsItem,
    meta: {
      paragraphCount: result.paragraphCount,
      characterCount: result.characterCount,
      matchedVesselsCount: newsItem.matchedVessels ? newsItem.matchedVessels.length : 0,
      regulationsCount: newsItem.regulations ? newsItem.regulations.length : 0
    }
  };
};

/**
 * Henüz detaylı metni kazınmamış tüm haberleri toplu olarak derin web kazımasından geçirir.
 */
export const scrapeAllUnscrapedNews = async (limit = 30) => {
  // Henüz isFullyScraped: false olan ve geçerli http URL'i bulunan haberleri bul
  const pendingNews = await News.find({
    $or: [
      { isFullyScraped: false },
      { isFullyScraped: { $exists: false } },
      { fullContent: null }
    ],
    sourceUrl: { $exists: true, $ne: null, $regex: /^http/i }
  }).limit(limit);

  let successCount = 0;
  let failCount = 0;
  const results = [];
  const errors = [];

  for (const newsItem of pendingNews) {
    try {
      const scraped = await scrapeArticleContent(newsItem.sourceUrl);
      newsItem.fullContent = scraped.fullContent;
      newsItem.isFullyScraped = true;
      newsItem.scrapedAt = new Date();
      await newsItem.save();

      // Otomatik Gemi Varlık Eşleme & Regülasyon Sınıflandırması
      try {
        await matchVesselsForNewsItem(newsItem);
        await classifyRegulationsForNewsItem(newsItem);
      } catch (e) {}

      successCount++;
      results.push(newsItem);
    } catch (err) {
      failCount++;
      // Sayfadan içerik kazınamazsa (404/403/engellenmiş link) haberi özeti ile tamamla ve döngüde takılmasını önle
      newsItem.fullContent = newsItem.summary || newsItem.title;
      newsItem.isFullyScraped = true;
      newsItem.scrapedAt = new Date();
      await newsItem.save();

      try {
        await matchVesselsForNewsItem(newsItem);
        await classifyRegulationsForNewsItem(newsItem);
      } catch (e) {}

      errors.push({ newsId: newsItem.id, title: newsItem.title, url: newsItem.sourceUrl, error: err.message });
    }
  }

  return {
    success: true,
    scrapedCount: successCount,
    failedCount: failCount,
    totalProcessed: pendingNews.length,
    data: results,
    errors
  };
};
