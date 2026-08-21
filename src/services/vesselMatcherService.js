import { Vessel } from '../models/Vessel.js';
import { News } from '../models/News.js';

/**
 * Metin içerisinde geçen gemi ismi veya IMO numarasının etrafındaki cümle alıntısını (snippet) çıkarır.
 */

const extractSnippet = (text, keyword, windowSize = 70) => {
  if (!text || !keyword) return '';
  
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);

  if (index === -1) return '';

  const start = Math.max(0, index - windowSize);
  const end = Math.min(text.length, index + keyword.length + windowSize);

  let snippet = text.substring(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
};

/**
 * Metin içeriğinde (Haber başlığı, özeti veya tam metni) tanımlı gemileri tespit eden eşleme motoru
 */
export const matchVesselsInText = (text, registeredVessels) => {
  if (!text || !Array.isArray(registeredVessels) || registeredVessels.length === 0) {
    return [];
  }

  const matchesMap = new Map(); // Vessel ID -> Match Object
  const lowerText = text.toLowerCase();

  for (const vessel of registeredVessels) {
    const vesselId = vessel._id.toString();
    const vName = vessel.vesselName.trim();
    const imo = vessel.imoNumber ? vessel.imoNumber.replace(/\D/g, '') : null; // Sadece 7 rakam

    let isMatched = false;
    let confidenceScore = 0.9;
    let matchKeyword = vName;

    // 1. IMO Numarasına Göre Tam Eşleşme Kontrolü (Güven Skoru: 1.0)
    if (imo && imo.length === 7) {
      if (text.includes(imo) || lowerText.includes(`imo ${imo}`)) {
        isMatched = true;
        confidenceScore = 1.0;
        matchKeyword = imo;
      }
    }

    // 2. Gemi Adına Göre Kelime Sınırı (Word Boundary) Kontrolü (Güven Skoru: 0.9)
    if (!isMatched && vName.length >= 3) {
      // Özel karakterleri escape et
      const escapedName = vName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'i');

      if (nameRegex.test(text)) {
        isMatched = true;
        confidenceScore = 0.9;
        matchKeyword = vName;
      }
    }

    if (isMatched) {
      const mentionSnippet = extractSnippet(text, matchKeyword);

      // Daha yüksek güven skorlu eşleşmeyi koru
      if (!matchesMap.has(vesselId) || matchesMap.get(vesselId).confidenceScore < confidenceScore) {
        matchesMap.set(vesselId, {
          vessel: vessel._id,
          vesselName: vessel.vesselName,
          imoNumber: vessel.imoNumber,
          confidenceScore,
          mentionSnippet
        });
      }
    }
  }

  return Array.from(matchesMap.values());
};

/**
 * Belirli bir haber nesnesi için veritabanındaki tüm gemilerle Varlık Eşleme (Entity Matching) yapar.
 */
export const matchVesselsForNewsItem = async (newsItem, registeredVessels = null) => {
  if (!newsItem) return [];

  const vessels = registeredVessels || await Vessel.find();
  const fullSearchText = `${newsItem.title || ''} ${newsItem.summary || ''} ${newsItem.fullContent || ''}`;

  const matched = matchVesselsInText(fullSearchText, vessels);

  newsItem.matchedVessels = matched;
  await newsItem.save();

  return matched;
};

/**
 * Veritabanındaki tüm haberleri tarayarak gemi eşleşmelerini toplu günceller.
 */
export const matchVesselsForAllNews = async (limit = 100) => {
  const vessels = await Vessel.find();
  const newsList = await News.find().limit(limit);

  let updatedNewsCount = 0;
  let totalMatchesCount = 0;

  for (const newsItem of newsList) {
    const matched = await matchVesselsForNewsItem(newsItem, vessels);
    if (matched.length > 0) {
      updatedNewsCount++;
      totalMatchesCount += matched.length;
    }
  }

  return {
    success: true,
    processedNewsCount: newsList.length,
    updatedNewsCount,
    totalMatchesCount
  };
};
