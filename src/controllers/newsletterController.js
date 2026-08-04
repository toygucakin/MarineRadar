import { Newsletter } from '../models/Newsletter.js';
import { News } from '../models/News.js';
import mongoose from 'mongoose';

/**
 * Controller (Akıllı Bülten Derleyici Katmanı)
 */

// POST /api/newsletters/generate -> Otomatik Özel Bülten Oluşturur
export const generateNewsletter = async (req, res, next) => {
  try {
    const { minImpactScore = 7.0, limit = 5, category } = req.body || {};

    const filter = {};
    if (minImpactScore !== undefined) {
      filter.impactScore = { $gte: Number(minImpactScore) };
    }
    if (category) {
      filter.category = category;
    }

    // Etki puanına göre en önemli haberleri seçiyoruz
    let selectedNews = await News.find(filter)
      .sort({ impactScore: -1, publishedAt: -1 })
      .limit(Number(limit));

    // Eğer belirtilen kriterde haber bulunamadıysa fallback olarak en son haberlerden seçer
    if (selectedNews.length === 0) {
      selectedNews = await News.find()
        .sort({ impactScore: -1, publishedAt: -1 })
        .limit(Number(limit));
    }

    if (selectedNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bülten oluşturmak için henüz veritabanında haber bulunmamaktadır. Önce haber kazıma yapınız.'
      });
    }

    // Ortalama Etki Puanı (averageImpactScore) Hesabı
    const totalScore = selectedNews.reduce((acc, item) => acc + item.impactScore, 0);
    const averageImpactScore = Math.round((totalScore / selectedNews.length) * 10) / 10;

    // En ağırlıklı kategorinin tespiti (topCategory)
    const categoryCounts = {};
    selectedNews.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, 'Genel');

    // Bülten Başlık ve Özeti
    const dateStr = new Date().toISOString().split('T')[0];
    const newsletterTitle = `MyCarbons Özel Bülteni (${dateStr})`;
    const newsletterSummary = `Bu bülten, etki puanı en yüksek ${selectedNews.length} adet gemicilik ve karbonsuzlaşma haberinden derlenmiştir. (Ortalama Etki Puanı: ${averageImpactScore}/10)`;

    // Veritabanına kayıt
    const newNewsletter = await Newsletter.create({
      title: newsletterTitle,
      summary: newsletterSummary,
      featuredNews: selectedNews.map(news => news._id),
      topCategory,
      averageImpactScore
    });

    // Mongoose .populate() ile haber detaylarını ilişkisel olarak doldurarak yanıt dönüyoruz
    const populatedNewsletter = await Newsletter.findById(newNewsletter._id).populate('featuredNews');

    res.status(201).json({
      success: true,
      message: 'MyCarbons Özel Bülteni başarıyla oluşturuldu ve arşivlendi.',
      data: populatedNewsletter
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/newsletters -> Tüm Arşivlenmiş Bültenleri Getirir
export const getAllNewsletters = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.find()
      .populate('featuredNews')
      .sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      count: newsletters.length,
      data: newsletters
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/newsletters/:id -> Tek Bir Bülten Detayını Getirir
export const getNewsletterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan bülten bulunamadı.`
      });
    }

    const newsletter = await Newsletter.findById(id).populate('featuredNews');

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan bülten bulunamadı.`
      });
    }

    res.status(200).json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};
