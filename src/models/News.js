import mongoose from 'mongoose';

/**
 * Gemicilik ve Karbon Analiz Bülteni (News) Mongoose Şeması
 */
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Haber başlığı zorunludur.'],
    trim: true,
    minlength: [3, 'Haber başlığı en az 3 karakter olmalıdır.']
  },
  summary: {
    type: String,
    required: [true, 'Haber özeti zorunludur.'],
    trim: true,
    minlength: [10, 'Haber özeti en az 10 karakter olmalıdır.']
  },
  category: {
    type: String,
    required: [true, 'Haber kategorisi zorunludur.'],
    enum: [
      'Clean Energy',
      'Regulations',
      'Carbon Emissions',
      'Green Ports',
      'Maritime & Environment',
      'Green Fleet',
      'Alternative Fuels',
      'Genel'
    ],
    default: 'Genel'
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    default: 'Anonim Analist',
    trim: true
  },
  impactScore: {
    type: Number,
    required: [true, 'Etki puanı (impactScore) zorunludur.'],
    min: [0, 'Etki puanı 0\'dan küçük olamaz.'],
    max: [10, 'Etki puanı 10\'dan büyük olamaz.']
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  fullContent: {
    type: String,
    default: null,
    trim: true
  },
  isFullyScraped: {
    type: Boolean,
    default: false
  },
  scrapedAt: {
    type: Date,
    default: null
  },
  matchedVessels: [
    {
      vessel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vessel'
      },
      vesselName: { type: String, trim: true },
      imoNumber: { type: String, trim: true },
      confidenceScore: { type: Number, min: 0, max: 1, default: 0.9 },
      mentionSnippet: { type: String, trim: true }
    }
  ],
  regulations: [
    {
      name: { type: String, trim: true },
      code: { type: String, trim: true },
      impactLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      mentionSnippet: { type: String, trim: true }
    }
  ],
  complianceRisk: {
    riskScore: { type: Number, min: 0, max: 10, default: 0 },
    riskLevel: { type: String, enum: ['Critical', 'High', 'Moderate', 'Low', 'None'], default: 'None' },
    summary: { type: String, trim: true }
  },
  aiNote: {
    type: String,
    trim: true,
    default: null
  },
  aiVessels: [
    {
      type: String,
      trim: true
    }
  ],
  aiImportanceScore: {
    type: Number,
    min: [0, 'AI etki puanı 0\'dan küçük olamaz.'],
    max: [10, 'AI etki puanı 10\'dan büyük olamaz.'],
    default: null
  },
  aiCategorized: {
    type: Boolean,
    default: false
  },
  aiAnalyzedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

// JSON yanıtlarında '_id' alanını 'id' olarak sunmak ve '__v' alanını gizlemek için transform
newsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const News = mongoose.model('News', newsSchema);
