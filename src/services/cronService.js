import cron from 'node-cron';
import { scrapeRssFeeds } from './rssService.js';
import { scrapeHtmlTargets } from './htmlService.js';

/**
 * Otomatik Zamanlanmış Görevler (Cron Jobs) Servisi
 */
export const initCronJobs = () => {
  // Her 6 saatte bir (veya her gece saat 00:00'da "0 0 * * *") arka planda otomatik veri kazıma görevi
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ [Cron Job] Arka plan otomatik veri kazıma görevi başlatıldı...');
    try {
      // 1. RSS Akışı Kazıma
      const rssResult = await scrapeRssFeeds();
      console.log(`⏰ [Cron Job] RSS Kazıma: ${rssResult.addedCount} yeni haber eklendi, ${rssResult.skippedCount} atlandı.`);

      // 2. HTML Web Kazıma
      const htmlResult = await scrapeHtmlTargets();
      console.log(`⏰ [Cron Job] HTML Kazıma: ${htmlResult.addedCount} yeni haber eklendi, ${htmlResult.skippedCount} atlandı.`);
    } catch (error) {
      console.error('❌ [Cron Job] Görev çalışırken hata oluştu:', error.message);
    }
  });

  console.log('⚡ Zamanlanmış Görevler (Cron Jobs) Aktif Hale Getirildi (Her 6 saatte bir periyodik arka plan taraması).');
};
