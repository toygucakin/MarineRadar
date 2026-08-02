/**
 * Validation Middleware (İstek Doğrulama Katmanı)
 * POST /api/news ile gelen istek gövdesini (req.body) denetler.
 * Hatalı veri varsa 400 Bad Request ile ayrıntılı hata listesi döner.
 */
export const validateCreateNews = (req, res, next) => {
  const { title, summary, category, impactScore } = req.body;
  const errors = [];

  // Title doğrulaması
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push("'title' alanı zorunludur ve en az 3 karakterli metin olmalıdır.");
  }

  // Summary doğrulaması
  if (!summary || typeof summary !== 'string' || summary.trim().length < 5) {
    errors.push("'summary' alanı zorunludur ve en az 5 karakterli metin olmalıdır.");
  }

  // Category doğrulaması
  if (!category || typeof category !== 'string') {
    errors.push("'category' alanı zorunludur (ör: 'Maritime & Environment').");
  }

  // ImpactScore doğrulaması (0 ile 10 arasında bir sayı olmalı)
  if (impactScore === undefined || typeof impactScore !== 'number' || impactScore < 0 || impactScore > 10) {
    errors.push("'impactScore' alanı zorunludur ve 0 ile 10 arasında sayısal bir değer almalıdır.");
  }

  // Eğer herhangi bir doğrulama hatası varsa isteği iptal et ve 400 döne
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'İstek Doğrulama Hatası (Validation Error)',
      details: errors
    });
  }

  // Her şey yolundaysa isteği bir sonraki aşamaya (Controller) aktar
  next();
};
