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
