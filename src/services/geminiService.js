import { GoogleGenerativeAI } from '@google/generative-ai';
import { News } from '../models/News.js';

/**
 * Gemini AI İstemci Başlatıcı
 * @param {string} [overrideModel] - İsteğe bağlı model adı
 */
const getGeminiModel = (overrideModel) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ortam değişkeni tanımlanmamış.');
  }

  const modelName = overrideModel || process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });
};

/**
 * Yardımcı Uyu Fonksiyonu
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Belirli bir haberi Google Gemini AI ile analiz eder ve Mongoose modelini günceller.
 * Otomatik yenileme ve 503/geçici hata durumunda yedek model desteğine sahiptir.
 * 
 * @param {string} newsId - Analiz edilecek haberin ID'si
 * @returns {Promise<Object>} Analiz edilen haber dokümanı
 */
export const analyzeNewsWithGemini = async (newsId) => {
  const news = await News.findById(newsId);
  if (!news) {
    throw new Error(`Haber bulunamadı (ID: ${newsId})`);
  }

  const contentToAnalyze = news.fullContent && news.fullContent.length > 50
    ? news.fullContent
    : `${news.title}\n\n${news.summary}`;

  const prompt = `
Sen küresel denizcilik sektörü, gemi emisyonları (IMO DCS, EU ETS, FuelEU Maritime) ve karbonsuzlaşma teknolojileri konusunda uzmanlaşmış bir Yapay Zeka Analistisin.

Aşağıdaki denizcilik haberini analiz et ve İSTENDİĞİ GİBİ STRICT JSON FORMATINDA YANIT VER:

Haber Başlığı: "${news.title}"
Haber Özeti: "${news.summary}"
Makale Metni: "${contentToAnalyze.substring(0, 3000)}"

Yanıt JSON Formatı:
{
  "aiNote": "Haber içeriğinin denizcilik emisyonları, karbon yakalama, regülasyon uyumu veya filo operasyonlarına etkisine dair Türkçe olarak yazılmış 2-3 cümlelik uzman değerlendirme notu.",
  "category": "Aşağıdaki kategorilerden en uygun olan bir tanesini seç: 'Clean Energy', 'Regulations', 'Carbon Emissions', 'Green Ports', 'Maritime & Environment', 'Green Fleet', 'Alternative Fuels', 'Genel'",
  "aiImportanceScore": 8.5,
  "aiVessels": ["Haberde adı geçen tüm gemi isimleri ve IMO numaraları dizisi (Örn: 'M/T Aegean Green', 'IMO 9876543'). Yoksa boş dizi [] dön."]
}
`;

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-flash-latest',
    'gemini-3.6-flash'
  ];

  let lastError = null;
  let responseText = null;

  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = getGeminiModel(modelName);
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [Gemini AI] Model ${modelName} (Deneme ${attempt}) hata aldı: ${err.message}`);
        // 503 veya geçici ağ hatalarında kısa bekleme
        if (err.status === 503 || err.message.includes('503')) {
          await sleep(1500);
        }
      }
    }
    if (responseText) break;
  }

  if (!responseText) {
    throw new Error(`Gemini AI çağrısı başarısız oldu: ${lastError ? lastError.message : 'Yanıt alınamadı'}`);
  }

  // JSON Temizleme ve Ayrıştırma
  let parsedData;
  try {
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedData = JSON.parse(cleanedJson);
  } catch (parseError) {
    console.error('❌ [Gemini AI] JSON Ayrıştırma Hatası:', responseText);
    throw new Error('Gemini AI yanıtı geçerli bir JSON formatında değildi.');
  }

  // Haber Dokümanını Güncelle
  news.aiNote = parsedData.aiNote || 'Yapay zeka analizi başarıyla tamamlandı.';
  if (parsedData.category) {
    news.category = parsedData.category;
  }
  if (typeof parsedData.aiImportanceScore === 'number') {
    news.aiImportanceScore = Math.min(10, Math.max(0, parsedData.aiImportanceScore));
  }
  if (Array.isArray(parsedData.aiVessels)) {
    news.aiVessels = parsedData.aiVessels.map(v => String(v).trim()).filter(Boolean);
  }

  news.aiCategorized = true;
  news.aiAnalyzedAt = new Date();

  await news.save();

  console.log(`🤖 [Gemini AI] Haber Başarıyla Analiz Edildi: "${news.title}" (Etki Skoru: ${news.aiImportanceScore})`);
  return news;
};

/**
 * Veritabanındaki henüz Gemini AI analizi yapılmamış tüm haberleri toplu olarak analiz eder.
 * @param {number} limit - Maksimum analiz edilecek haber sayısı
 * @returns {Promise<Object>} Toplu analiz raporu
 */
export const analyzeAllUnprocessedNewsWithGemini = async (limit = 10) => {
  const unprocessedNews = await News.find({ aiCategorized: { $ne: true } }).limit(limit);

  const report = {
    totalFound: unprocessedNews.length,
    analyzedCount: 0,
    failedCount: 0,
    analyzedNews: []
  };

  if (unprocessedNews.length === 0) {
    return report;
  }

  for (const news of unprocessedNews) {
    try {
      const updatedNews = await analyzeNewsWithGemini(news.id);
      report.analyzedCount++;
      report.analyzedNews.push({
        id: updatedNews.id,
        title: updatedNews.title,
        aiImportanceScore: updatedNews.aiImportanceScore,
        category: updatedNews.category
      });
    } catch (err) {
      console.error(`⚠️ [Gemini Batch] "${news.title}" analiz edilemedi:`, err.message);
      report.failedCount++;
    }
  }

  console.log(`📊 [Gemini AI Batch] Toplu Analiz Tamamlandı: ${report.analyzedCount}/${report.totalFound} Başarılı.`);
  return report;
};
