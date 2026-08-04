import cron from 'node-cron';
import { scrapeRssFeeds } from './rssService.js';
import { scrapeHtmlTargets } from './htmlService.js';

/**
 * Veri Kazıma Görevini Çalıştıran Yardımcı Fonksiyon
 */
const runScrapingJob = async (reason = 'Zamanlanmış') => {
  console.log(`⏰ [Cron Job] Arka plan otomatik veri kazıma görevi başlatıldı (${reason})...`);
  try {
    // 1. RSS Akışı Kazıma
    const rssResult = await scrapeRssFeeds();
    console.log(`⏰ [Cron Job - RSS]: ${rssResult.addedCount} yeni haber eklendi, ${rssResult.skippedCount} mevcut haber atlandı.`);

    // 2. HTML Web Kazıma
    const htmlResult = await scrapeHtmlTargets();
    console.log(`⏰ [Cron Job - HTML]: ${htmlResult.addedCount} yeni haber eklendi, ${htmlResult.skippedCount} mevcut haber atlandı.`);
  } catch (error) {
    console.error('❌ [Cron Job] Görev çalışırken hata oluştu:', error.message);
  }
};

/**
 * Otomatik Zamanlanmış Görevler (Cron Jobs) Servisi
 */
export const initCronJobs = () => {
  // 1. Sunucu açılır açılmaz (2 saniye sonra) 1 defa otomatik tarama yap
  setTimeout(() => {
    runScrapingJob('Sunucu Açılış Taraması');
  }, 2000);

  // 2. Her 6 saatte bir ("0 */6 * * *") arka planda otomatik periyodik tarama yap
  cron.schedule('0 */6 * * *', () => {
    runScrapingJob('6 Saatlik Periyodik Tarama');
  });

  console.log('⚡ Zamanlanmış Görevler Aktif: Sunucu açıldığında otomatik 1 defa ve her 6 saatte bir arka planda haber tarayacak.');
};
