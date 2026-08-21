import { News } from '../models/News.js';

/**
 * Denizcilik Regülasyonları ve Emisyon Sözlüğü (Maritime Regulation Dictionary)
 */
const REGULATION_DEFINITIONS = [
  {
    code: 'EU_ETS',
    name: 'EU ETS (Emissions Trading System)',
    keywords: ['eu ets', 'emissions trading system', 'eua', 'carbon allowance', 'maritime ets', 'carbon price', 'ets compliance'],
    impactLevel: 'High'
  },
  {
    code: 'EU_MRV',
    name: 'EU-MRV (Monitoring & Reporting)',
    keywords: ['eu mrv', 'mrv regulation', 'monitoring reporting verification', 'mrv database', 'thetis-mrv'],
    impactLevel: 'Medium'
  },
  {
    code: 'IMO_DCS',
    name: 'IMO DCS (Data Collection System)',
    keywords: ['imo dcs', 'data collection system', 'fuel oil consumption data', 'imo dcs reporting'],
    impactLevel: 'Medium'
  },
  {
    code: 'FUELEU_MARITIME',
    name: 'FuelEU Maritime',
    keywords: ['fueleu', 'fuel eu', 'maritime fuel intensity', 'ghg intensity limit', 'fueleu penalty', 'fueleu compliance'],
    impactLevel: 'High'
  },
  {
    code: 'CII_EEXI',
    name: 'CII & EEXI (Carbon Intensity & Efficiency)',
    keywords: ['cii', 'eexi', 'carbon intensity indicator', 'energy efficiency existing ship', 'cii rating', 'cii grade', 'eexi compliance'],
    impactLevel: 'High'
  },
  {
    code: 'GREEN_CORRIDORS',
    name: 'Green Corridors',
    keywords: ['green corridor', 'decarbonized shipping route', 'zero-emission corridor', 'green shipping corridor'],
    impactLevel: 'Low'
  },
  {
    code: 'ALT_FUELS',
    name: 'Alternative Fuels & Clean Tech',
    keywords: ['biofuel', 'ammonia', 'hydrogen', 'methanol', 'lng', 'scrubber', 'dual-fuel', 'wind-assisted', 'rotor sail', 'carbon capture'],
    impactLevel: 'Medium'
  },
  {
    code: 'POSEIDON_PRINCIPLES',
    name: 'Poseidon Principles',
    keywords: ['poseidon principles', 'climate alignment', 'green ship financing', 'sea cargo charter'],
    impactLevel: 'Low'
  }
];

/**
 * Metin içerisinde geçen regülasyon keyword'ünün etrafındaki alıntıyı çıkarır.
 */
const extractSnippet = (text, keyword, windowSize = 75) => {
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
 * Derin haber metinlerini denizcilik regülasyonlarına göre etiketler ve Uyumluluk Risk Skoru (Compliance Risk) hesaplar.
 */
export const analyzeRegulations = (text = '') => {
  if (!text || text.length < 5) {
    return {
      regulations: [],
      complianceRisk: { riskScore: 0, riskLevel: 'None', summary: 'Yeterli metin içeriği bulunamadı.' }
    };
  }

  const lowerText = text.toLowerCase();
  const detectedRegulations = [];

  // 1. Regülasyon Kategori Eşlemesi
  for (const reg of REGULATION_DEFINITIONS) {
    for (const kw of reg.keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        const snippet = extractSnippet(text, kw);
        detectedRegulations.push({
          code: reg.code,
          name: reg.name,
          impactLevel: reg.impactLevel,
          mentionSnippet: snippet
        });
        break; // Bu regülasyon kategorisinden bir keyword bulduysak diğerine geç
      }
    }
  }

  // 2. Uyumluluk Risk Skoru (Compliance Risk Assessment) Hesaplaması
  let baseScore = 0;
  let riskKeywordsCount = 0;

  // Yüksek etki düzeyindeki regülasyon sayısı taban puanı artırır
  const highImpactRegs = detectedRegulations.filter(r => r.impactLevel === 'High').length;
  baseScore += highImpactRegs * 2.5;

  const medImpactRegs = detectedRegulations.filter(r => r.impactLevel === 'Medium').length;
  baseScore += medImpactRegs * 1.5;

  // Kritik Ceza / Risk Kelimeleri Taraması
  const penaltyKeywords = ['penalty', 'fine', 'sanction', 'ban', 'detention', 'deadline', 'non-compliance', 'eua deficit', 'cii rating d', 'cii rating e', 'enforcement'];
  for (const pkw of penaltyKeywords) {
    if (lowerText.includes(pkw)) {
      riskKeywordsCount++;
    }
  }

  baseScore += riskKeywordsCount * 1.2;

  // Skor 0.0 - 10.0 arasında sınırlandırılır
  const riskScore = Math.min(10.0, Math.max(0.0, Math.round(baseScore * 10) / 10));

  let riskLevel = 'None';
  let summary = 'Bu haberde herhangi bir denizcilik regülasyonu riski tespit edilmedi.';

  if (riskScore >= 7.5) {
    riskLevel = 'Critical';
    summary = 'Kritik Uyumluluk Riski: Yüksek yaptırım, ceza veya zorunlu emisyon kısıtlaması içeriyor.';
  } else if (riskScore >= 5.0) {
    riskLevel = 'High';
    summary = 'Yüksek Regülasyon Etkisi: Emisyon ticareti (EU ETS/FuelEU) veya zorunlu raporlama içeriyor.';
  } else if (riskScore >= 2.5) {
    riskLevel = 'Moderate';
    summary = 'Orta Düzey Regülasyon Bağlamı: Raporlama, izleme veya yeşil dönüşüm girişimleri içeriyor.';
  } else if (riskScore > 0) {
    riskLevel = 'Low';
    summary = 'Düşük Risk / Gönüllü Yeşil İnisiyatif: Genel denizcilik çevre haberleri.';
  }

  return {
    regulations: detectedRegulations,
    complianceRisk: {
      riskScore,
      riskLevel,
      summary
    }
  };
};

/**
 * Belirli bir haber nesnesi için regülasyon sınıflandırmasını çalıştırır ve veritabanına kaydeder.
 */
export const classifyRegulationsForNewsItem = async (newsItem) => {
  if (!newsItem) return null;

  const fullSearchText = `${newsItem.title || ''} ${newsItem.summary || ''} ${newsItem.fullContent || ''}`;
  const result = analyzeRegulations(fullSearchText);

  newsItem.regulations = result.regulations;
  newsItem.complianceRisk = result.complianceRisk;
  await newsItem.save();

  return result;
};

/**
 * Veritabanındaki tüm haberleri tarayarak regülasyon sınıflandırmalarını ve risk skorlarını günceller.
 */
export const classifyRegulationsForAllNews = async (limit = 500) => {
  const newsQuery = News.find().sort({ updatedAt: -1, _id: -1 });
  if (limit > 0) {
    newsQuery.limit(limit);
  }
  const newsList = await newsQuery;

  let classifiedNewsCount = 0;
  let totalRegulationsCount = 0;

  for (const newsItem of newsList) {
    const result = await classifyRegulationsForNewsItem(newsItem);
    if (result && result.regulations.length > 0) {
      classifiedNewsCount++;
      totalRegulationsCount += result.regulations.length;
    }
  }

  return {
    success: true,
    processedNewsCount: newsList.length,
    classifiedNewsCount,
    totalRegulationsCount
  };
};
