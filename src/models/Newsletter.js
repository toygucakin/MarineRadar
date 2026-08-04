import mongoose from 'mongoose';

/**
 * MyCarbons Özel Bülten (Newsletter) Mongoose Şeması
 * 'featuredNews' alanı Mongoose Referans Yapısı (Populate) ile 'News' modeline bağlanır.
 */
const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bülten başlığı zorunludur.'],
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  featuredNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  topCategory: {
    type: String,
    default: 'Genel'
  },
  averageImpactScore: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// JSON yanıtlarında '_id' alanını 'id' yapma ve '__v' alanını gizleme
newsletterSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Newsletter = mongoose.model('Newsletter', newsletterSchema);
