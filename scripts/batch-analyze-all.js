import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import { News } from '../src/models/News.js';
import { analyzeNewsWithGemini } from '../src/services/geminiService.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🔌 Veritabanına bağlanılıyor...');
  await connectDB();

  const unprocessedNews = await News.find({ aiCategorized: { $ne: true } }).select('_id title');
  const total = unprocessedNews.length;

  console.log(`🚀 Toplam ${total} adet işlenmemiş haber için Gemini AI toplu analizi başlatılıyor...`);
  console.log(`⏱️ Google API Kota güvenliği için istekler arasında 4.2 saniye bekleme uygulanacaktır.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < unprocessedNews.length; i++) {
    const news = unprocessedNews[i];
    const index = i + 1;

    try {
      console.log(`[${index}/${total}] Analiz ediliyor: "${news.title}"...`);
      const updated = await analyzeNewsWithGemini(news._id);
      successCount++;
      console.log(`   ✅ Kategori: [${updated.category}] | AI Skoru: ${updated.aiImportanceScore}/10 | Gemiler: ${updated.aiVessels.length > 0 ? updated.aiVessels.join(', ') : 'Yok'}`);
    } catch (err) {
      failCount++;
      console.error(`   ❌ Hata: ${err.message}`);
    }

    if (i < unprocessedNews.length - 1) {
      await sleep(4200);
    }
  }

  console.log(`\n🎉 TOPLU ANALİZ TAMAMLANDI!`);
  console.log(`📊 Toplam: ${total} | Başarılı: ${successCount} | Başarısız: ${failCount}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Kritik Hata:', err);
  process.exit(1);
});
