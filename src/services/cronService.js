import cron from 'node-cron';
import { scrapeRssFeeds } from './rssService.js';
import { scrapeHtmlTargets } from './htmlService.js';
import { scrapeAllUnscrapedNews } from './deepScraperService.js';
import { matchVesselsForAllNews } from './vesselMatcherService.js';
import { classifyRegulationsForAllNews } from './regulationService.js';

/**
 * 4 Aşamalı Tam Otomatik Veri Boru Hattı (Full Pipeline Engine)
 * Stage 1: RSS & HTML Web Ingestion
 * Stage 2: Deep Article Scraper (Full Content Extraction)
 * Stage 3: Multi-Vessel Entity Matcher (IMO & Vessel Names)
 * Stage 4: Maritime Regulation Classifier & Compliance Risk Assessor
 */
export const runFullPipeline = async (reason = 'Zamanlanmış Pipeline') => {
  console.log(`⚡ [Pipeline Engine] 4 Aşamalı Veri Boru Hattı Başlatıldı (${reason})...`);
  const startTime = Date.now();

  const report = {
    rssAdded: 0,
    htmlAdded: 0,
    deepScrapedCount: 0,
    matchedVesselsCount: 0,
    classifiedRegulationsCount: 0,
    durationMs: 0
  };

  try {
    // Stage 1: RSS & HTML Ingestion
    console.log('📌 [Stage 1/4] RSS & HTML Akış Kazıma...');
    const rssRes = await scrapeRssFeeds();
    const htmlRes = await scrapeHtmlTargets();
    report.rssAdded = rssRes.addedCount || 0;
    report.htmlAdded = htmlRes.addedCount || 0;

    // Stage 2: Deep Article Scraping
    console.log('📌 [Stage 2/4] Derin Makale Metni Kazıma (Deep Scraper)...');
    const deepRes = await scrapeAllUnscrapedNews(50);
    report.deepScrapedCount = deepRes.scrapedCount || 0;

    // Stage 3: Multi-Vessel Entity Matching
    console.log('📌 [Stage 3/4] Gemi Varlık Eşleme (Vessel Entity Matcher)...');
    const vesselRes = await matchVesselsForAllNews(500);
    report.matchedVesselsCount = vesselRes.totalMatchesCount || 0;

    // Stage 4: Regulation Classification & Compliance Risk Assessment
    console.log('📌 [Stage 4/4] Regülasyon ve Uyumluluk Analizi (Regulation Classifier)...');
    const regRes = await classifyRegulationsForAllNews(500);
    report.classifiedRegulationsCount = regRes.totalRegulationsCount || 0;

    report.durationMs = Date.now() - startTime;
    console.log(`✅ [Pipeline Engine] 4 Aşamalı Boru Hattı Başarıyla Tamamlandı! (${report.durationMs} ms)`);
    console.log(`📊 Pipeline Özeti: RSS: +${report.rssAdded}, HTML: +${report.htmlAdded}, Derin Kazınan: ${report.deepScrapedCount}, Eşleşen Gemi: ${report.matchedVesselsCount}, Regülasyon Etiketi: ${report.classifiedRegulationsCount}`);

    return { success: true, report };
  } catch (error) {
    console.error('❌ [Pipeline Engine] Boru hattı yürütülürken hata oluştu:', error.message);
    return { success: false, error: error.message, report };
  }
};

/**
 * Otomatik Zamanlanmış Görevler (Cron Jobs) Servisi
 */
export const initCronJobs = () => {
  // 1. Sunucu açılır açılmaz (2 saniye sonra) 1 defa tam 4 aşamalı boru hattını çalıştır
  setTimeout(() => {
    runFullPipeline('Sunucu Açılış Taraması');
  }, 2000);

  // 2. Her 6 saatte bir ("0 */6 * * *") arka planda tam boru hattını çalıştır
  cron.schedule('0 */6 * * *', () => {
    runFullPipeline('6 Saatlik Periyodik Tarama');
  });

  console.log('⚡ Zamanlanmış Veri Boru Hattı Aktif: Sunucu açıldığında ve her 6 saatte bir (Ingest ➔ Deep Scrape ➔ Vessel Match ➔ Regulation Classifier) adımlarını otomatik çalıştıracak.');
};
