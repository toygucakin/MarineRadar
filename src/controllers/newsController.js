import { mockNews } from '../data/mockNews.js';

/**
 * Controller (İş Mantığı Katmanı)
 */

// GET /api/news -> Tüm haberleri getirir
export const getAllNews = (req, res) => {
  res.status(200).json({
    success: true,
    count: mockNews.length,
    data: mockNews
  });
};

// GET /api/news/:id -> Tek bir haberi getirir
export const getNewsById = (req, res) => {
  const { id } = req.params;
  const newsItem = mockNews.find(item => item.id === id);

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
};

// POST /api/news -> Yeni gemicilik haberi ekler
export const createNews = (req, res) => {
  const { title, summary, category, author, impactScore } = req.body;

  // Yeni benzersiz id ve tarih üretiyoruz
  const newNewsItem = {
    id: `news-${Date.now()}`,
    title,
    summary,
    category,
    publishedAt: new Date().toISOString(),
    author: author || 'Anonim Analist',
    impactScore
  };

  // Dizimize ekliyoruz (Veritabanı yerine belleğe yazıyoruz)
  mockNews.push(newNewsItem);

  // HTTP Status 201 (Created) ile yeni oluşturulan veriyi dönüyoruz
  res.status(201).json({
    success: true,
    message: 'Yeni gemicilik haberi başarıyla eklendi.',
    data: newNewsItem
  });
};
