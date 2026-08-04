import Parser from 'rss-parser';
import { News } from '../models/News.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MarineRadar-Bot/1.0'
  },
  timeout: 10000
});

// Otomatik haber kazıma için varsayılan gemicilik ve denizcilik RSS akışları
const DEFAULT_RSS_FEEDS = [
  'https://gcaptain.com/feed/',
  'https://splash247.com/feed/',
  'https://www.marineinsight.com/feed/'
];

/**
 * Anahtar kelimelere göre etki puanı (impactScore) ve kategori hesaplama yardımcısı
 */
const analyzeContent = (title = '', summary = '') => {
  const text = `${title} ${summary}`.toLowerCase();
  
  let impactScore = 6.0; // Varsayılan etki puanı
  let category = 'Genel';

  if (text.includes('carbon') || text.includes('emission') || text.includes('cii') || text.includes('eexi')) {
    category = 'Carbon Emissions';
    impactScore += 2.5;
  } else if (text.includes('lng') || text.includes('hydrogen') || text.includes('ammonia') || text.includes('methanol')) {
    category = 'Alternative Fuels';
    impactScore += 2.0;
  } else if (text.includes('green') || text.includes('environment') || text.includes('decarbonization')) {
    category = 'Clean Energy';
    impactScore += 2.0;
  } else if (text.includes('port') || text.includes('terminal')) {
    category = 'Green Ports';
    impactScore += 1.5;
  } else if (text.includes('imo') || text.includes('regulation') || text.includes('policy')) {
    category = 'Regulations';
    impactScore += 1.8;
  }

  // Puanı 0.0 - 10.0 arasında sınırla
  impactScore = Math.min(10.0, Math.max(0.0, Math.round(impactScore * 10) / 10));

  return { category, impactScore };
};

/**
 * RSS Akışlarını Kazıyan ve MongoDB'ye Çift Kayıt Engellemeli (Deduplication) Kaydeden Servis
 */
export const scrapeRssFeeds = async (customFeeds = null) => {
  const feedsToScrape = customFeeds || DEFAULT_RSS_FEEDS;
  let addedCount = 0;
  let skippedCount = 0;
  const errors = [];
  const addedNews = [];

  for (const feedUrl of feedsToScrape) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        const title = item.title ? item.title.trim() : null;
        const sourceUrl = item.link ? item.link.trim() : null;
        const rawSummary = item.contentSnippet || item.content || item.summary || title;
        const summary = rawSummary ? rawSummary.substring(0, 300).trim() : title;

        if (!title || !sourceUrl || title.length < 3) {
          continue;
        }

        // Çift Kayıt Engelleme (Deduplication): Aynı sourceUrl veya başlık var mı?
        const existingNews = await News.findOne({
          $or: [
            { sourceUrl: sourceUrl },
            { title: title }
          ]
        });

        if (existingNews) {
          skippedCount++;
          continue;
        }

        // İçerik analizi ile kategori ve etki puanı üretimi
        const { category, impactScore } = analyzeContent(title, summary);

        // Veritabanına kayıt
        const newNews = await News.create({
          title,
          summary,
          category,
          sourceUrl,
          author: item.creator || feed.title || 'RSS Bot',
          impactScore,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
        });

        addedNews.push(newNews);
        addedCount++;
      }
    } catch (err) {
      console.error(`❌ RSS Akışı Kazınırken Hata (${feedUrl}): ${err.message}`);
      errors.push({ feedUrl, message: err.message });
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
