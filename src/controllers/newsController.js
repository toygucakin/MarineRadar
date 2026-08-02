import { mockNews } from '../data/mockNews.js';

/**
 * Controller (İş Mantığı Katmanı)
 * Gelen HTTP isteklerini karşılar, veriyi işler ve uygun HTTP yanıtını döner.
 */

// Tüm gemicilik haberlerini getiren fonksiyon
export const getAllNews = (req, res) => {
  // HTTP status 200 ve tüm haber listesini JSON dizisi (array) olarak döndürüyoruz
  res.status(200).json({
    success: true,
    count: mockNews.length,
    data: mockNews
  });
};

// ID bazlı tek bir gemicilik haberini getiren fonksiyon
export const getNewsById = (req, res) => {
  const { id } = req.params; // URL'den gelen id parametresini alıyoruz (ör. /api/news/news-101)

  // Veri kümemizde ilgili id'ye sahip haberi arıyoruz
  const newsItem = mockNews.find(item => item.id === id);

  // Eğer haber bulunamadıysa HTTP 404 (Not Found) status kodu döndürüyoruz
  if (!newsItem) {
    return res.status(404).json({
      success: false,
      message: `ID değeri '${id}' olan haber bulunamadı.`
    });
  }

  // Haber bulunduysa HTTP 200 (OK) ile haberi döndürüyoruz
  res.status(200).json({
    success: true,
    data: newsItem
  });
};
